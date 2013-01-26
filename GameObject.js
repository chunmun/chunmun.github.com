var MAX_HEALTH = 100;
var MAX_SPEED = 10000;

/*
Creates or augments an object with Moving functionality.

args may contain x, y, speed, maxSpeed, angle.
*/
function GameObject(args){
    if(!args){
      return;
    }
    
    // Default arguments
    this.id = args.id;
    this.x = args.x || 0;
    this.y = args.y || 0;
    this.speed = args.speed || 0;
    this.maxSpeed = args.maxSpeed || MAX_SPEED;
    this.viewAngle = args.viewAngle || args.angle || 0;
    this.health = args.health || MAX_HEALTH;
    this.visibility = args.visibility || 0;
    this.damage = args.damage || 0;

    this.prevX = args.prevX || this.x;
    this.prevY = args.prevY || this.y;

    this.speedAngle = args.speedAngle || this.viewAngle;
    this.polyCoords = args.polyCoords;
}



GameObject.prototype.getDistanceTo = function(x, y) {
    function square(x){ return x * x; };
    return Math.sqrt(square(this.x - x) + square(this.y - y));
};



GameObject.prototype.getDistanceToPoint = function(pt) {
    return this.getDistanceTo(pt[0], pt[1]);
};



GameObject.prototype.getDistanceToUnit = function(unit) {
    return this.getDistanceTo(unit.x, unit.y);
};



GameObject.prototype.move = function(delta){
    //console.log("parent move " + x + "," + y + "," + speed + "," + speedAngle);
    var k = delta / 1000;
    
    //console.log("move: " + x + "," + y + "," + speedAngle + "," + speed + "," + k);
    this.setX(this.x + Math.cos(this.speedAngle) * this.speed * k);
    this.setY(this.y + -Math.sin(this.speedAngle) * this.speed * k); //-ve, since axis is inverted.
};


GameObject.prototype.adjustSpeed = function(ds){
    // Current speed vector
    var sx = Math.cos(this.speedAngle * this.speed);
    var sy = Math.sin(-(this.speedAngle * this.speed));
    
    // Add vectors
    sx += Math.cos(this.viewAngle) * ds;
    sy += Math.sin(-this.viewAngle) * ds;
    
    var ts = Math.sqrt(sx*sx + sy*sy); // New Magnitude
    this.speedAngle = Math.atan2(-sy, sx); //atan2??
    this.speed = Math.max(0, Math.min(ts, this.maxSpeed));
};



GameObject.prototype.adjustAngle = function(da){
    this.viewAngle += da;
    
    if(this.viewAngle < 0) this.viewAngle += 2*Math.PI;
    if(this.viewAngle > 2*Math.PI) this.viewAngle -= 2*Math.PI;
};



GameObject.prototype.coordEquals = function (obj){
    return this.getX && Math.abs(obj.getX() - this.getX()) < 0.0001 &&
           this.getY && Math.abs(obj.getY() - this.getY()) < 0.0001 &&
           this.getSpeed && Math.abs(obj.getSpeed() - this.getSpeed()) < 0.0001 &&
           this.getViewAngle && Math.abs(obj.getViewAngle() - this.getViewAngle()) < 0.0001 &&
           this.getObjectType() == obj.getObjectType();
};

GameObject.prototype.setX = function(nx){ this.prevX = this.x; this.x = nx; };
GameObject.prototype.getX = function(){ return this.x; };
GameObject.prototype.getPreviousX = function(){ return this.prevX; };
GameObject.prototype.setY = function(ny){ this.prevY = this.y; this.y = ny; };
GameObject.prototype.getY = function(){ return this.y; };
GameObject.prototype.getPreviousY = function(){ return this.prevY; };
GameObject.prototype.setSpeed = function(ns){ this.speed = ns; };
GameObject.prototype.getSpeed = function(){ return this.speed; };
GameObject.prototype.getMoveAngle = function(){ return this.speedAngle; };
GameObject.prototype.getViewAngle = function(){ return this.viewAngle; };
GameObject.prototype.setAngle = function(a){ this.viewAngle = a; this.speedAngle = a; };
GameObject.prototype.setViewAngle = function(a){ this.viewAngle = a; };
GameObject.prototype.setMoveAngle = function(a){ this.speedAngle = a; };
GameObject.prototype.getHealth = function(){ return this.health; };
GameObject.prototype.setHealth = function(a){ this.health = a; };
GameObject.prototype.getVisibility = function(){ return this.visibility; };
GameObject.prototype.setVisibility = function(a) { this.visibility = a; };
GameObject.prototype.getDamage = function() { return this.damage; };
GameObject.prototype.setDamage = function(a) { this.damage = a; };

GameObject.prototype.accelerate = function(ds){ this.adjustSpeed(ds || 150); };
GameObject.prototype.decelerate = function(ds){ this.adjustSpeed(-ds || -100); };

GameObject.prototype.turnLeft = function(da){ this.adjustAngle(da || (Math.PI / 18)); };
GameObject.prototype.turnRight = function(da){ this.adjustAngle(-da || (-Math.PI / 18)); };

GameObject.prototype.getObjectType = function(){ return -1; };
GameObject.prototype.getPolygonCoordinates = function(){ return this.polyCoords; };

/*
 Calculates the polygon coordinates for the moving object,
 and returns the calculated value.
*/
GameObject.prototype.calculatePolygonCoordinates = function(){
    // Transform point by movingObj's x, y, viewAngle.
    function transformPoint(p){
        // Rotate, then translate
        q = Geometry.rotatePoint(p, this.getViewAngle());
        q = Geometry.translatePoint(q, this.getX(), this.getY());
    
        return q;
    }
    
    return this.polyCoords.map(transformPoint.bind(this));
}



/*
 Returns a box which is the minimal rectangle which contains all
 vertices of the polygon.
 
 Time complexity O(n), by number of points.
 
 The box is returned in form of [x, y, w, h].
*/
GameObject.prototype.getBoundingBox = function(){
    return Geometry.boundingBoxForPolygon(this.calculatePolygonCoordinates());
}



// Checks whether this collides with another GameObject
// O(mn) time complexity.
GameObject.prototype.collidesWith = function(polyObj){
    // Check that the other object has the right methods
    if(!polyObj.getBoundingBox || !polyObj.calculatePolygonCoordinates){
        return false;
    }
    
    // Check whether the bounding boxes overlap before
    // calculating whether they intersect.
    // O(m + n)
    var rectA = this.getBoundingBox();
    var rectB = polyObj.getBoundingBox();
    var collisionMightExist = (rectA[0] + rectA[2] >= rectB[0] && rectA[0] <= rectB[0] + rectB[2]) &&
                              (rectA[1] + rectA[3] >= rectB[1] && rectA[1] <= rectB[1] + rectB[3]);
    
    if(!collisionMightExist){
        return false;
    }
    
    // A collision might exist,
    // check that it does.
    // O(mn)
    var poly1 = this.calculatePolygonCoordinates();
    var poly2 = polyObj.calculatePolygonCoordinates();
    return Geometry.linePolygonIntersect([[this.getPreviousX(), this.getPreviousY()],
                                          [this.getX(), this.getY()]],
                                          poly2) ||
           Geometry.linePolygonIntersect([[polyObj.getPreviousX(), polyObj.getPreviousY()],
                                          [polyObj.getX(), polyObj.getY()]],
                                          poly1) ||
           Geometry.polygonsIntersect(poly1, poly2);
};



GameObject.prototype.render = function(context){
    var x = this.getX();
    var y = this.getY();
    var va = this.getViewAngle();
    
    context.beginPath();
    
    // Angle here, 0 is at EAST, PI/2 is at NORTH.
    var coords = this.calculatePolygonCoordinates();
    
    context.moveTo(coords[0][0], coords[0][1]);
    for(var i = 1; i < this.polyCoords.length; i++){
        context.lineTo(coords[i][0], coords[i][1]);
    }
    context.lineTo(coords[0][0], coords[0][1]);
    
    context.strokeStyle = "#000000";
    context.lineWidth = 1;
    context.closePath();
    context.stroke();
    
    //Fill in the shape
    if(this.fillColor){
        context.fillStyle = this.fillColor;
        context.fill();
    }
}



GameObject.prototype.equals = function (o){
    // Check mobj equality first.
    if(!coordEquals(this, o)){
        return false;
    }
    
    var o_coords = o.getPolygonCoordinates();
    
    if(this.polyCoords.length != o_coords.length){ // same number of coords.
        return false;
    }
    
    // Check all coordinates are the same.
    for(var i = 0; i < this.polyCoords.length; i++){
        if(Math.abs(o_coords[i][0] - this.polyCoords[i][0]) > 0.0001 ||
           Math.abs(o_coords[i][1] - this.polyCoords[i][1]) > 0.0001){
            return false;
        }
    }
    
    return true;
};


GameObject.prototype.isExpired = function() {
    return this.health<=0;
};