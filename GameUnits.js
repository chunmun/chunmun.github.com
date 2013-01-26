/*
File for GameUnits - Hero, Monsters, Traps and Bullets
*/

var SPEED_HERO = 50.0;
var SPEED_MONSTER = 40.0;

var HEALTH_HERO = 1000;
var HEALTH_MONSTER = 50;

/*
Augment GameObject with Hero characteristics
*/
function Hero(args){
	var that = this;
	if(!args){
		return;
	}	
	GameObject.call(this,args);

	this.health = args.health || HEALTH_HERO;
	this.speed = args.speed || SPEED_HERO;

	this.scale = args.scale;
	this.spriteSheet = args.spriteSheet;
	this.upAnimation = new Animation({
		spriteSheet:this.spriteSheet,
		animation:[{spriteName:"up1",length:0.1},{spriteName:"up2",length:0.1},{spriteName:"up3",length:0.1},{spriteName:"up4",length:0.1}],
		repeat:true,
		keyframe:0
	});

	this.downAnimation = new Animation({
		spriteSheet:this.spriteSheet,
		animation:[{spriteName:"dn1",length:0.1},{spriteName:"dn2",length:0.1},{spriteName:"dn3",length:0.1},{spriteName:"dn4",length:0.1}],
		repeat:true,
		keyframe:0
	});

	this.leftAnimation = new Animation({
		spriteSheet:this.spriteSheet,
		animation:[{spriteName:"lf1",length:0.1},{spriteName:"lf2",length:0.1},{spriteName:"lf3",length:0.1},{spriteName:"lf4",length:0.1}],
		repeat:true,
		keyframe:0
	});

	this.rightAnimation = new Animation({
		spriteSheet:this.spriteSheet,
		animation:[{spriteName:"rg1",length:0.1},{spriteName:"rg2",length:0.1},{spriteName:"rg3",length:0.1},{spriteName:"rg4",length:0.1}],
		repeat:true,
		keyframe:0
	});

	
}

Hero.prototype = new GameObject();

Hero.prototype.moveUp = function(delta){
	this.setY(Math.max(0,this.getY()-delta*this.getSpeed()));
	this.upAnimation.update(delta);
}

Hero.prototype.moveDown = function(delta){
	this.setY(Math.min(GAME_HEIGHT,this.getY()+delta*this.getSpeed()));
	this.downAnimation.update(delta);
}

Hero.prototype.moveRight = function(delta){
	this.setX(Math.max(0,this.getX()+delta*this.getSpeed()));
	this.rightAnimation.update(delta);
}

Hero.prototype.moveLeft = function(delta){
	this.setX(Math.min(GAME_WIDTH,this.getX()-delta*this.getSpeed()));
	this.leftAnimation.update(delta);
}

Hero.prototype.move = function(delta){
	this.setX(this.getX());
	this.setY(this.getY());
}

Hero.prototype.render = function(ctx){
	// console.log((this.getPreviousX()-this.getX())+':'+this.getX());
	if(this.getPreviousX()>this.getX()){
		this.leftAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		this.setX(this.getX());
		return;
	} else if(this.getPreviousX()<this.getX()){
		this.rightAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		this.setX(this.getX());
		return;
	} else if(this.getPreviousY()<this.getY()){
		this.downAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		this.setY(this.getY());
		return;
	} else if(this.getPreviousY()>this.getY()){
		this.upAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);		
		this.setY(this.getY());
		return;
	} else {
		this.downAnimation.reset();
		this.downAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		return;
	}

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
	this.scale = args.scale || 1;
	this.isActive = false;

	this.spriteAnimation = args.animation || null;
	console.log(this.spriteAnimation);
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
	this.spriteAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
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