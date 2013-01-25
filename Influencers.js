/*
  Influencers.js - file for influencers of the Zombies,
    which act as player input.
*/



function identity(x){ return x; };
function constant_high(x){ return 1; };
function linear_decrease(x){ return 1 - x; };
function sqrt_decrease(x){ return 1 - 0.85 * Math.sqrt(x);};
function sqrt_high_decrease(x){ return 1 - Math.sqrt(x);};



/*
 * Each influence will have its influence shape.
 * At present, this is just assumed to be a circle, with a radius
 * about a certain x and y.
 * TODO: Refactor Geometry so as to allow for a Circle object.
 */
function Influencer(args){
    if(!args){
        return;
    }
    
    this.x = args.x || -1;
    this.y = args.y || -1;
    this.radius = args.radius || 1;
    
    this.t = 0;
    this.duration = args.duration || -1;
    this.opacityFunction = args.opacityFunction || constant_high;
}



Influencer.prototype.tick = function(delta){
    if(this.duration > 0){ this.t += delta / this.duration; }
};



Influencer.prototype.isExpired = function(){
    return this.duration > 0 && this.t > 1;
};



Influencer.prototype.hasInfluenceOnUnit = function(unit){
    return this.isUnitInInfluenceArea(unit);
}



Influencer.prototype.isInInfluenceArea = function(x, y){
    function sq(x){ return x*x; };
    return Math.sqrt(sq(x - this.x) + sq(y - this.y)) <= this.radius;
}



Influencer.prototype.isUnitInInfluenceArea = function(unit){
    return unit.getDistanceTo(this.x, this.y) <= this.radius;
}



/*
  Draws an effect, using the given context, under the given game unit.
*/
Influencer.prototype.drawEffectUnderUnit = function(ctx, unit){
    
}



/*
  Draws a preview of effect, using the given context, under the given game unit.
*/
Influencer.prototype.drawEffectUnderUnitPreview = function(ctx, unit){
    var oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.5;
    
    this.drawEffectUnderUnit(ctx, unit);
    
    ctx.globalAlpha = oldAlpha;
}



/*
  Draws an effect, using the given context, over the given game unit.
*/
Influencer.prototype.drawEffectOnUnit = function(ctx, unit){
    
}



/*
  Draws a preview of effect, using the given context, over the given game unit.
*/
Influencer.prototype.drawEffectOnUnitPreview = function(ctx, unit){
    var oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.5;
    
    this.drawEffectOnUnit(ctx, unit);
    
    ctx.globalAlpha = oldAlpha;
}



/*
  Draws an preview of the effective area onto the given context.
*/
Influencer.prototype.drawEffectiveAreaPreview = function(ctx){
    var oldAlpha = ctx.globalAlpha;
    
    ctx.globalAlpha = 0.3 * this.opacityFunction(this.t);
    this.drawEffectiveArea(ctx);
    
    ctx.globalAlpha = oldAlpha;
}



/*
  Draws the effective area onto the given context.
*/
Influencer.prototype.drawEffectiveArea = function(ctx){
    
}



Influencer.prototype.invoke = function(unit){

}



function MovementInfluencer(args){
    Influencer.call(this, args);
    
    this.direction = args.direction; // as vector
    this.directionVector = getUnitVectorForDirection(args.direction); // as vector
    this.directionAngle = Math.atan2(this.directionVector[1], this.directionVector[0]);
    
    this.fillColor = "#00FF55";
    this.lineColor = "#00DD33";
}
MovementInfluencer.prototype = new Influencer();



MovementInfluencer.prototype.getMovementDirection = function(){
    return this.direction;
};



MovementInfluencer.prototype.hasInfluenceOnUnit = function(unit){
    return unit instanceof Zombie &&
           this.isUnitInInfluenceArea(unit);
}



MovementInfluencer.prototype.drawEffectiveArea = function(ctx){
    var oldFillStyle = ctx.fillStyle;
    var oldStrokeStyle = ctx.strokeStyle;
    var oldAlpha = ctx.globalAlpha;
    var opF = this.opacityFunction(this.t);
    ctx.globalAlpha = 0.6 * ctx.globalAlpha *  opF;
    
    // Draw Circle of Radius
    ctx.beginPath();
    ctx.fillStyle = this.fillColor;
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.lineColor;
    // draw circle
    ctx.arc(this.x,
            this.y,
            this.radius,
            0 ,
            2 * Math.PI,
            false);
    ctx.fill();
    ctx.stroke();
    
    // Draw arrow in direction (70% radius)
    ctx.globalAlpha = (1 - (1 - 0.5 * opF));
    ctx.save();
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.directionAngle);
    ctx.scale(0.7 * this.radius, 0.7 * this.radius);
    
    ctx.lineWidth = 0.03;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(1,0);
    ctx.lineTo(0, 0);
    ctx.moveTo(1,0);
    ctx.lineTo(0.8, 0.2);
    ctx.moveTo(1,0);
    ctx.lineTo(0.8, -0.2);
    ctx.stroke();
    
    ctx.restore();
    
    ctx.globalAlpha = oldAlpha;
    ctx.fillStyle = oldFillStyle;
    ctx.strokeStyle = oldStrokeStyle;
}



MovementInfluencer.prototype.invoke = function(unit){
    if (!unit instanceof Zombie){
        throw "Boomse. No zombie.";
    }

    var road = unit.getCurrentRoad();

    function getDestPointInDirection(rd, dir){
            var nextExit = rd.getExitInDirection(dir);
            var pt = Geometry.midpoint(nextExit);
            
            switch(dir){
                case ROAD_DIRECTION_EAST:
                    return [pt[0] - ROAD_RADIUS, pt[1]];
                case ROAD_DIRECTION_WEST:
                    return [pt[0] + ROAD_RADIUS, pt[1]];
                case ROAD_DIRECTION_NORTH:
                    return [pt[0], pt[1] + ROAD_RADIUS];
                case ROAD_DIRECTION_SOUTH:
                    return [pt[0], pt[1] - ROAD_RADIUS];
                default:
                    return pt;
            }
        }
        
    function findDestinationPointForRoad(anotherRoad){
            // Return the point which is close to the furthest
            // & opposite exit from the current road.
            // NOTE: anotherRoad is a neighbour of road.
            var dir = road.findDirectionToNeighbour(anotherRoad);
            return getDestPointInDirection(anotherRoad, dir);
    }
    
    var nextRd = road.getRoadInDirection(this.direction);
            
    if(nextRd != null){
        var nextPt = findDestinationPointForRoad(nextRd);
        unit.setDestinationPoint(nextPt);
        
        var relY = (nextPt[1] - unit.getY());
        var relX = (nextPt[0] - unit.getX());
        var theta = Math.atan2(relY, relX);
        unit.setMoveAngle(- theta);
    }
}



function BuffInfluencer(args){
    Influencer.call(this,args);
    
    this.fillColor = "#33FFFF";
    this.lineColor = "#FF0000";
    this.superColor = "#FF33CC";
    this.speed = 60;
    this.health = 400;
    
}

BuffInfluencer.prototype = new Influencer();


BuffInfluencer.prototype.hasInfluenceOnUnit = function(unit){
    return unit instanceof Zombie &&
           this.isUnitInInfluenceArea(unit);
}


BuffInfluencer.prototype.drawEffectOnUnit = function(ctx, unit){
    var oldFillStyle = ctx.fillStyle;
    var oldStrokeStyle = ctx.strokeStyle;
    var oldAlpha = ctx.globalAlpha;
    var time = new Date();
    var opF = (Math.sin(time.getMilliseconds()/1000* Math.PI));
    ctx.globalAlpha = ctx.globalAlpha *  opF;
    
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.fillText("S", unit.x-ZOMBIE_SQUARE_HALFWIDTH, unit.y+ZOMBIE_SQUARE_HALFWIDTH);
    
    ctx.globalAlpha = oldAlpha;
    ctx.fillStyle = oldFillStyle;
    ctx.strokeStyle = oldStrokeStyle;
}



/*
  Draws a preview of effect, using the given context, over the given game unit.
*/
BuffInfluencer.prototype.drawEffectOnUnitPreview = function(ctx, unit){
    if(!this.hasInfluenceOnUnit(unit)){
        return;
    }

    var oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 1;
    
    this.drawEffectOnUnit(ctx, unit);
    
    ctx.globalAlpha = oldAlpha;
}

BuffInfluencer.prototype.drawEffectiveArea = function(ctx){
    var oldFillStyle = ctx.fillStyle;
    var oldStrokeStyle = ctx.strokeStyle;
    var oldAlpha = ctx.globalAlpha;
    var opF = this.opacityFunction(this.t);
    ctx.globalAlpha = ctx.globalAlpha *  opF;
    
    // Draw Circle of Radius
    ctx.beginPath();
    ctx.fillStyle = this.fillColor;
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.lineColor;
    // draw circle
    ctx.arc(this.x,
            this.y,
            this.radius,
            0 ,
            2 * Math.PI,
            false);
    ctx.fill();
    ctx.stroke();
    
    ctx.globalAlpha = oldAlpha;
    ctx.fillStyle = oldFillStyle;
    ctx.strokeStyle = oldStrokeStyle;
}

BuffInfluencer.prototype.invoke = function(unit){
    if(!unit instanceof Zombie){
        throw "Boomse no Zombie."
    }
    var oldSpeed = unit.setSpeed;
    var oldHealth = unit.getHealth;
    unit.setSpeed(this.speed);
    unit.setHealth(this.health);
    unit.fillColor = this.superColor;
}