/*
File for GameUnits - Hero, Monsters, Traps and Bullets
*/

var SPEED_HERO = 25;
var SPEED_MONSTER = 10;

var HEALTH_HERO = 1000;
var HEALTH_MONSTER = 50;

/*
Augment GameObject with Hero characteristics
*/
function Hero(args){
	if(!args){
		return;
	}	
	GameObject.call(this,args);

	this.health = args.health || HEALTH_HERO;
	this.speed = args.speed || SPEED_HERO;
}

Hero.prototype = new GameObject();



/*
Augment GameObject with Monster characteristics
*/
function Monster(args){
	if(!args){
		return;
	}
	GameObject.call(this,args);

	this.health = args.health || HEALTH_MONSTER;
	this.speed = args.speed || SPEED_MONSTER;
}

Monster.prototype = new GameObject();



/*
Augment GameObject with Trap characteristics
*/
function Trap(args){
	if(!args){
		return;
	}
	GameObject.call(this,args);

	this.health = 1; // This is pretty just so it doesn't return true on isExpired
	this.speed = 0;
}

Trap.prototype = new GameObject();


/*
Augment GameObject with Bullet characteristics
*/
function Bullet(args){
    if(!args){
        return;
    }

    GameObject.call(this, args);

    this.distance = 0;
    this.range = args.range || 1000;
    this.damageAmount = args.damageAmount || BULLET_DEFAULT_DAMAGE_AMOUNT; // default, two hits to kill
    this.setSpeed(args.speed || 1000);
}
Bullet.prototype = new GameObject();



Bullet.prototype.move = function(delta){
    GameObject.prototype.move.call(this, delta);
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
    GameObject.prototype.move.call(this, delta);

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