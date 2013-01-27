/*
File for GameUnits - Hero, Monsters, Traps and Bullets
*/

var SPEED_HERO = 120.0;
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
	this.isSacrificing = false;
	this.t = 0;
	this.upAnimation = new Animation({
		spriteSheet:this.spriteSheet,
		animation:[{spriteName:"up1",length:0.1},{spriteName:"up2",length:0.1},{spriteName:"up3",length:0.1}],
		repeat:true,
		keyFrame:0
	});

	this.downAnimation = new Animation({
		spriteSheet:this.spriteSheet,
		animation:[{spriteName:"dn1",length:0.1},{spriteName:"dn2",length:0.1},{spriteName:"dn3",length:0.1}],
		repeat:true,
		keyFrame:0
	});

	this.leftAnimation = new Animation({
		spriteSheet:this.spriteSheet,
		animation:[{spriteName:"lf1",length:0.1},{spriteName:"lf2",length:0.1},{spriteName:"lf3",length:0.1}],
		repeat:true,
		keyFrame:0
	});

	this.rightAnimation = new Animation({
		spriteSheet:this.spriteSheet,
		animation:[{spriteName:"rg1",length:0.1},{spriteName:"rg2",length:0.1},{spriteName:"rg3",length:0.1}],
		repeat:true,
		keyFrame:0
	});

	this.sacrificeAnimation = new Animation({
		spriteSheet:args.sacrificeSS,
		animation:[{spriteName:"sac1",length:0.1},{spriteName:"sac2",length:0.05},{spriteName:"sac3",length:0.05}],
		repeat:true,
		keyframe:0,
	});
	this.sacrificeTime = 0.2;
	
}

Hero.prototype = new GameObject();

Hero.prototype.startSacrifice = function(){
	this.isSacrificing = true;
}

Hero.prototype.moveUp = function(delta){
	this.setY(Math.max(20,this.getY()-delta*this.getSpeed()));
	this.upAnimation.update(delta);
}

Hero.prototype.moveDown = function(delta){
	this.setY(Math.min(GAME_HEIGHT-240,this.getY()+delta*this.getSpeed()));
	this.downAnimation.update(delta);
}

Hero.prototype.moveRight = function(delta){
	this.setX(Math.min(GAME_WIDTH+80,this.getX()+delta*this.getSpeed()));
	this.rightAnimation.update(delta);
}

Hero.prototype.moveLeft = function(delta){
	this.setX(Math.max(20,this.getX()-delta*this.getSpeed()));
	this.leftAnimation.update(delta);
}

Hero.prototype.move = function(delta){
	this.health -= delta*10;
	if(this.isSacrificing){
		this.t += delta;
		this.sacrificeAnimation.update(delta);
		if(this.t>this.sacrificeTime){
			this.isSacrificing = false;
			this.t = 0;
		}
	}
}

Hero.prototype.render = function(ctx){
	// console.log((this.getPreviousX()-this.getX())+':'+this.getX());
	if(this.isSacrificing){
		this.sacrificeAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		return;
	}
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
	this.isActive = false;
	
	this.scale = args.scale;
	this.spriteSheet = args.spriteSheet;
    this.t = 0;
    this.startline = 5;

    this.carrot = args.carrot;
    
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

Monster.prototype = new GameObject();

Monster.prototype.getBoundingBox = function(){
    var monstWidth = 200;
    var monstHeight = 200;
    return [this.x,
            this.y,
            this.x + monstWidth,
            this.y + monstHeight];
}

//Hans
Monster.prototype.move = function(delta,hero){
	this.t += delta;

	this.leftAnimation.update(delta);
	this.rightAnimation.update(delta);
	this.upAnimation.update(delta);
	this.downAnimation.update(delta);
    
    this.carrot.speed = this.speed * delta;
    updateAICarrot(this.carrot);
    
    var cpt = this.carrot.pt;
    var dx = cpt[0] - this.x;
    var dy = cpt[1] - this.y;

    // Consider if Hero is close by
    if(this.getDistanceToUnit(hero)<100 && this.isActive){
        dx = hero.getX() - this.x;
        dy = hero.getY() - this.y;
    }

    var theta = Math.atan2(-dy, dx);
    this.setMoveAngle(theta);
    GameObject.prototype.move.call(this, delta);

    if(this.t>this.startline){
    	this.isActive = true;
    }
}

// Monster.prototype.render = function(ctx){
// 	if(!this.isActive){
// 		// Monster has not been activated
// 		this.spriteAnimation.reset();
// 	}
// 	this.spriteAnimation.render(ctx,this.x,this.y,1,this.visibility);
// }

Monster.prototype.render = function(ctx){
	//////////////////////////////////////////////////////////////////////////////////   TO RENDER CARROT
    // // Render carrot
    // ctx.beginPath();
    // var cpt = this.carrot.pt;
    // context.arc(cpt[0], cpt[1], 5, 0, 2 * Math.PI, false);
    // context.lineWidth = 2;
    // context.strokeStyle = '#0000FF';
    // context.stroke();
    
    
    // // Render carrot
    // ctx.beginPath();
    // context.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
    // context.lineWidth = 2;
    // context.strokeStyle = '#000000';
    // context.stroke();
    
    

	// console.log((this.getPreviousX()-this.getX())+':'+this.getX());
	var deltaX = this.getX() - this.getPreviousX();
	var deltaY = this.getY() - this.getPreviousY();
	///////////////////////////////////////////////////////////////////////////////ORIGINAL
	// if(this.getPreviousX()>this.getX()){
	// 	this.leftAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
	// 	this.setX(this.getX());
	// 	return;
	// } else if(this.getPreviousX()<this.getX()){
	// 	this.rightAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
	// 	this.setX(this.getX());
	// 	return;
	// } else if(this.getPreviousY()<this.getY()){
	// 	this.downAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
	// 	this.setY(this.getY());
	// 	return;
	// } else if(this.getPreviousY()>this.getY()){
	// 	this.upAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);		
	// 	this.setY(this.getY());
	// 	return;
	// } else {
	// 	this.downAnimation.reset();
	// 	this.downAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
	// 	return;
	// }
	//////////////////////////////////////////////////////////////////////////////////////
	var temp = this.visibility;
	if(!this.isActive){
		this.visibility = this.t/this.startline
	}else{
		this.visiblity = 1;
	}

	if ((deltaX < 0) && (Math.abs(deltaX) > Math.abs(deltaY))){
		this.leftAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		this.setX(this.getX());
		return;
	} else if((deltaX > 0) && (Math.abs(deltaX) > Math.abs(deltaY))){
		this.rightAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		this.setX(this.getX());
		return;
	} else if(deltaY > 0){
		this.downAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		this.setY(this.getY());
		return;
	} else if(deltaY < 0){
		this.upAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);		
		this.setY(this.getY());
		return;
	} else {
		this.downAnimation.reset();
		this.downAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
		return;
	}

	this.visibility = temp
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
	this.scale = args.scale || 1;
	this.isActive = false;

	this.spriteAnimation = args.animation || null;
	console.log(this.spriteAnimation);
}

Trap.prototype = new GameObject();

Trap.prototype.getBoundingBox = function(){
    var trapWidth = 200;
    var trapHeight = 200;
    return [this.x,
            this.y,
            this.x + trapWidth,
            this.y + trapHeight];
}

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



function Altar(args){
    if(!args) return;
	Trap.call(this,args);
	this.speed = 50;
    
    this.hasActivated = false;
    this.gameStartCallback = args.altarCallback;
}
Altar.prototype = new Trap();

Altar.prototype.activate = function(){
    this.hasActived = true;
    this.isActive = true;
    this.gameStartCallback();
}

Altar.prototype.render = function(ctx){
	if(!this.isActive){
		// Trap has not been activated by player
		this.spriteAnimation.reset();
	} 
	this.spriteAnimation.render(ctx,this.x,this.y,this.scale,this.visibility);
}

Altar.prototype.move = function(delta,hero){
    if(this.getDistanceToUnit(hero)>100 && !this.isActive){
    	var done = false;
		var sign = (Math.random()>0.5 ? 1 : -1);
		var choose_x = (Math.random()*620+10);
		var choose_y = (Math.random()*460+10);
	    var dx = choose_x - this.x;
	    var dy = choose_y - this.y;

	    var theta = Math.atan2(-dy, dx);
	    this.setMoveAngle(theta);
	    GameObject.prototype.move.call(this, delta);
    }
}