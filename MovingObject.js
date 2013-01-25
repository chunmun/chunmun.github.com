/*
Creates or augments an object with Moving functionality.

args may contain x, y, speed, maxSpeed, angle.
*/
function MovingObject(args){
    if(!args){
      return;
    }
    
    // Default arguments
    this.id = args.id;
    this.x = args.x || 0;
    this.y = args.y || 0;
    this.speed = args.speed || 0;
    this.maxSpeed = args.maxSpeed || 10000;
    this.viewAngle = args.viewAngle || args.angle || 0;

    this.prevX = args.prevX || this.x;
    this.prevY = args.prevY || this.y;

    this.speedAngle = args.speedAngle || this.viewAngle;
}



MovingObject.prototype.getDistanceTo = function(x, y) {
    function square(x){ return x * x; };
    return Math.sqrt(square(this.x - x) + square(this.y - y));
};



MovingObject.prototype.getDistanceToPoint = function(pt) {
    return this.getDistanceTo(pt[0], pt[1]);
};



MovingObject.prototype.getDistanceToUnit = function(unit) {
    return this.getDistanceTo(unit.x, unit.y);
};



MovingObject.prototype.move = function(delta){
    //console.log("parent move " + x + "," + y + "," + speed + "," + speedAngle);
    var k = delta / 1000;
    
    //console.log("move: " + x + "," + y + "," + speedAngle + "," + speed + "," + k);
    this.setX(this.x + Math.cos(this.speedAngle) * this.speed * k);
    this.setY(this.y + -Math.sin(this.speedAngle) * this.speed * k); //-ve, since axis is inverted.
};


MovingObject.prototype.adjustSpeed = function(ds){
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



MovingObject.prototype.adjustAngle = function(da){
    this.viewAngle += da;
    
    if(this.viewAngle < 0) this.viewAngle += 2*Math.PI;
    if(this.viewAngle > 2*Math.PI) this.viewAngle -= 2*Math.PI;
};



MovingObject.prototype.equals = function (obj){
    return this.getX && Math.abs(obj.getX() - this.getX()) < 0.0001 &&
           this.getY && Math.abs(obj.getY() - this.getY()) < 0.0001 &&
           this.getSpeed && Math.abs(obj.getSpeed() - this.getSpeed()) < 0.0001 &&
           this.getViewAngle && Math.abs(obj.getViewAngle() - this.getViewAngle()) < 0.0001 &&
           this.getObjectType() == obj.getObjectType();
};



MovingObject.prototype.setX = function(nx){ this.prevX = this.x; this.x = nx; };
MovingObject.prototype.getX = function(){ return this.x; };
MovingObject.prototype.getPreviousX = function(){ return this.prevX; };
MovingObject.prototype.setY = function(ny){ this.prevY = this.y; this.y = ny; };
MovingObject.prototype.getY = function(){ return this.y; };
MovingObject.prototype.getPreviousY = function(){ return this.prevY; };
MovingObject.prototype.setSpeed = function(ns){ this.speed = ns; };
MovingObject.prototype.getSpeed = function(){ return this.speed; };
MovingObject.prototype.getMoveAngle = function(){ return this.speedAngle; };
MovingObject.prototype.getViewAngle = function(){ return this.viewAngle; };
MovingObject.prototype.setAngle = function(a){ this.viewAngle = a; this.speedAngle = a; };
MovingObject.prototype.setViewAngle = function(a){ this.viewAngle = a; };
MovingObject.prototype.setMoveAngle = function(a){ this.speedAngle = a; };

MovingObject.prototype.accelerate = function(ds){ this.adjustSpeed(ds || 150); };
MovingObject.prototype.decelerate = function(ds){ this.adjustSpeed(-ds || -100); };

MovingObject.prototype.turnLeft = function(da){ this.adjustAngle(da || (Math.PI / 18)); };
MovingObject.prototype.turnRight = function(da){ this.adjustAngle(-da || (-Math.PI / 18)); };

MovingObject.prototype.getObjectType = function(){ return -1; };
