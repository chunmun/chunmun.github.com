/*
File for GameUnits - Hero, Monsters, Traps and Bullets
*/

var SPEED_HERO = 25.0;
var SPEED_MONSTER = 10.0;

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

	console.log('Created hero at ',this.getX(),',',this.getY(),',speed:',this.getSpeed());
}

Hero.prototype = new GameObject();

Hero.prototype.moveUp = function(delta){
	var that = this;
	// console.log("Moving Up");
	console.log(this);
	var speed = that.getSpeed();
	var small = delta*this.getSpeed();
	var result = this.getY()-delta*this.getSpeed();
	var math_rest = Math.max(0,this.getY()-delta*this.getSpeed());
	this.setY(Math.max(0,this.getY()-delta*this.getSpeed()));
	console.log(this.getX(),',',this.getY());
}

Hero.prototype.moveDown = function(delta){
	// console.log("Moving Down");
	this.y = Math.min(GAME_HEIGHT,this.y+delta*this.speed);
	// console.log(this.x,',',this.y);
}

Hero.prototype.moveLeft = function(delta){
	// console.log("Moving Left");
	this.x = Math.max(0,this.x-delta*this.speed);
	// console.log(this.x,',',this.y);
}

Hero.prototype.moveRight = function(delta){
	// console.log("Moving Right");
	this.x = Math.min(GAME_WIDTH,this.x+delta*this.speed);
	// console.log(this.x,',',this.y);
}

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
	this.isActive = false;
	
	this.spriteAnimation = args.animation || null;
}

Monster.prototype = new GameObject();

//Hans
Monster.prototype.move = function(delta){
	if(this.isActive){
		this.spriteAnimation.update(delta);
	}
}

Monster.prototype.render = function(ctx){
	if(!this.isActive){
		// Monster has not been activated
		this.spriteAnimation.reset();
	}
	this.spriteAnimation.render(ctx,this.x,this.y,1,this.visibility);
}

Monster.prototype.canDealDamage = function(){
	// This assumes that traps have their first frame as non-damaging frame
	return (this.spriteAnimation.getIndex() != 0);
}

Monster.prototype.activate = function(){ this.isActive = true; }
Monster.prototype.deactivate = function(){ this.isActive = false; }

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
	this.isActive = false;

	this.spriteAnimation = args.animation || null;
}

Trap.prototype = new GameObject();

Trap.prototype.move = function(delta){
	if(this.isActive){
		this.spriteAnimation.update(delta);
	}
}

Trap.prototype.render = function(ctx){
	if(!this.isActive){
		// Trap has not been activated by player
		this.spriteAnimation.reset();
	} 
	this.spriteAnimation.render(ctx,this.x,this.y,1,this.visibility);
}

Trap.prototype.canDealDamage = function(){
	// This assumes that traps have their first frame as non-damaging frame
	return (this.spriteAnimation.getIndex() != 0);
}

Trap.prototype.activate = function(){ this.isActive = true; }
Trap.prototype.deactivate = function(){ this.isActive = false; }

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