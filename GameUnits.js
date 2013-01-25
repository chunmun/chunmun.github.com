/*
  GameUnits.js - file for the game unit objects.
*/

var ObjectTypes = {ZOMBIE: 0,
                   CIVILIAN: 1,
                   SOLDIER: 2};
var ZOMBIE_DEFAULT_SPEED = 30;
var CIVILIAN_DEFAULT_SPEED = 10;
var CIVILIAN_RUNNING_SPEED = 25;
var SOLDIER_DEFAULT_SPEED = 5;

var SOLDIER_DEFAULT_SHOOT_PERIOD = 100;
var SOLDIER_DEFAULT_BULLET_DAMAGE = 50;

var BULLET_DEFAULT_DAMAGE_AMOUNT = 50;

var ZOMBIE_SQUARE_HALFWIDTH = 4;
var CIVILIAN_SQUARE_HALFWIDTH = 4;
var SOLDIER_SQUARE_HALFWIDTH = 5;

var ZOMBIE_COLOR = "#ff0077";
var CIVILIAN_COLOR = "#FFCC00";
var SOLDIER_COLOR = "#00FFFF";



/*
  Human as a superclass for both our humanoid zombies, and
  the civilian or military personel.
*/
function Human(args){
    if(!args){
      return;
    }
    
    MovingObject.call(this, args);

    this.health = 100 || args.health;

    // For AI / Movement
    this.currentRoad = null;
    this.previousRoad = null;
    this.destinationPoint = null;
}
Human.prototype = new RenderablePolygon();



Human.prototype.isExpired = function(){
    return this.health <= 0;
}



Human.prototype.setHealth = function(h){ this.health = h; };
Human.prototype.getHealth = function(){ return this.health; };

Human.prototype.setCurrentRoad = function(road){ this.previousRoad = this.currentRoad; this.currentRoad = road; };
Human.prototype.getCurrentRoad = function(){ return this.currentRoad; };
Human.prototype.getPreviousRoad = function(){ return this.previousRoad; };
Human.prototype.setDestinationPoint = function(pt){ this.destinationPoint = pt; };
Human.prototype.getDestinationPoint = function(){ return this.destinationPoint; };





/*
  Creates (or augments) an object with Zombie characteristics.
*/
function Zombie(args){
    if(!args){
      return;
    }

    Human.call(this, args);
    this.fillColor = ZOMBIE_COLOR;

    // RenderablePolygon Inheritance
    var zr = ZOMBIE_SQUARE_HALFWIDTH;
    args.polyCoords = [[zr, -zr], [-zr, -zr], [-zr, zr], [zr, zr]]; // rectangle.
    RenderablePolygon.call(this, args);
    
    this.setSpeed(ZOMBIE_DEFAULT_SPEED);
}
Zombie.prototype = new Human();

Zombie.prototype.getObjectType = function(){ return ObjectTypes.ZOMBIE; };





/*
  Creates (or augments) an object with Civilian characteristics.
  
  Civilians are the 'targets' for the zombies, and are a basic game
  element so as to increase the zombie population.
*/
function Civilian(args){
    if(!args){
      return;
    }

    Human.call(this, args);
    this.fillColor = CIVILIAN_COLOR;

    // RenderablePolygon Inheritance
    var zr = CIVILIAN_SQUARE_HALFWIDTH;
    args.polyCoords = [[zr, -zr], [-zr, -zr], [-zr, zr], [zr, zr]]; // rectangle.
    RenderablePolygon.call(this, args);
    
    this.setSpeed(CIVILIAN_DEFAULT_SPEED);
}
Civilian.prototype = new Human();

Civilian.prototype.getObjectType = function(){ return ObjectTypes.CIVILIAN; };







/*
  Creates (or augments) an object with Soldier characteristics.
  
  Soldiers are the 'hunters' of the zombies, and are a basic game
  element so as to decrease the zombie population.
*/
function Soldier(args){
    if(!args){
      return;
    }

    Human.call(this, args);
    this.fillColor = SOLDIER_COLOR;

    this.target = null;

    this.weaponCounter = 0;
    this.weaponDelay = (1 / args.shootFrequency) ||
                       args.reloadTime ||
                       SOLDIER_DEFAULT_SHOOT_PERIOD;

    // RenderablePolygon Inheritance
    var zr = SOLDIER_SQUARE_HALFWIDTH;
    args.polyCoords = [[zr, -zr], [-zr, -zr], [-zr, zr], [zr, zr]]; // rectangle.
    RenderablePolygon.call(this, args);
    
    this.setSpeed(SOLDIER_DEFAULT_SPEED);
}
Soldier.prototype = new Human();



Soldier.prototype.getRange = function(first_argument) {
    return 150;
};



Soldier.prototype.canShoot = function(){
    return this.weaponCounter + 1 >= this.weaponDelay && this.target;
}



// Will 'shoot' from the Soldier's weapon
// only if the soldier has a target and can shoot
Soldier.prototype.createBullet = function(){
    if(!this.canShoot()){
        throw "Cannot shoot!";
    }

    this.weaponCounter = 0;

    var inaccuracyAngle = (Math.PI / 180) / 3;
    var angleToTarget = Math.atan2((this.target.y - this.y),
                                   (this.target.x - this.x));
    angleToTarget += (Math.random() - 0.5) * inaccuracyAngle;

    var bullet = new Bullet({x: this.x,
                             y: this.y,
                             damageAmount: SOLDIER_DEFAULT_BULLET_DAMAGE,
                             angle: 2 * Math.PI - angleToTarget});
    return bullet;
}



Soldier.prototype.move = function(delta){
    // Superclass move, as Human
    Human.prototype.move.call(this, delta);

    // Update whether we can shoot or not
    if(this.weaponCounter < this.weaponDelay){
        this.weaponCounter += delta;
    }
}



Soldier.prototype.render = function(ctx) {
    // Superclass render, as RenderablePolygon
    RenderablePolygon.prototype.render.call(this, ctx);

    // If we have a target, draw LOS
    if(this.target){
        var x = this.x;
        var y = this.y;
        var tx = this.target.x;
        var ty = this.target.y;

        var oldAlpha = ctx.globalAlpha;
        
        ctx.beginPath();
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FF0000";
        ctx.moveTo(x, y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        ctx.globalAlpha = oldAlpha;
    }
};



Soldier.prototype.getObjectType = function(){ return ObjectTypes.SOLDIER; };







function Bullet(args){
    if(!args){
        return;
    }

    MovingObject.call(this, args);

    this.distance = 0;
    this.range = args.range || 1000;
    this.damageAmount = args.damageAmount || BULLET_DEFAULT_DAMAGE_AMOUNT; // default, two hits to kill
    this.setSpeed(args.speed || 1000);
}
Bullet.prototype = new MovingObject();



Bullet.prototype.move = function(delta){
    MovingObject.prototype.move.call(this, delta);
}



Bullet.prototype.getLine = function(){
//    return [[this.getPreviousX(), this.getPreviousY()],
//            [this.getX(), this.getY()]];
    return [[this.getX(), this.getY()],
            [this.getPreviousX(), this.getPreviousY()]];
};



// Return true if this bullet collides with
Bullet.prototype.hits = function(obj){
    return Geometry.linePolygonIntersect(this.getLine(), obj.calculatePolygonCoordinates());
};



Bullet.prototype.damage = function(obj){
    // Flag ourselves as expired..
    this.distance = this.range + 1;

    var px = this.getPreviousX();
    var py = this.getPreviousY();
    this.setX(px);
    this.setY(py);
    this.setX(obj.getX());
    this.setY(obj.getY());

    obj.setHealth(obj.getHealth() - this.damageAmount);
}



Bullet.prototype.isExpired = function(){
    return this.distance > this.range;
};



Bullet.prototype.move = function(delta) {
    MovingObject.prototype.move.call(this, delta);

    this.distance += this.getDistanceTo(this.getPreviousX(), this.getPreviousY());
};



Bullet.prototype.render = function(ctx){
    ctx.beginPath();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 0.5;
    ctx.moveTo(this.getX(), this.getY());
    ctx.lineTo(this.getPreviousX(), this.getPreviousY());
    ctx.stroke();
}
