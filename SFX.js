/*
  SFX.js - a file for Special Effects items, or items which serve no other purpose
        than simply to just look cool.
*/






/*
  SmokeEmitter - a smoke particle manager.
*/
function SmokeEmitter(args){
    this.x = args.x;
    this.y = args.y;
    
    this.t = 0;
    this.emitCounter = 0;
    this.emitPeriod = (1000 / args.emitFrequency) ||
                      args.emitPeriod ||
                      0.5;
    this.duration = args.duration || -1;
    
    this.__particles = [];
}



SmokeEmitter.prototype.tick = function(delta){
    if(this.duration > 0){ this.t += delta; }
    
    
    // Tick particles along
    this.__particles.forEach(function(p){
        p.tick(delta);
    });
    var expiredParticles = this.__particles.filter(function(p){
        return p.isExpired();
    });
    expiredParticles.forEach(function(p){
        removeFromList(p, this.__particles);
    }.bind(this));
    
    
    // Maybe generate a new particle
    //  if it's time to
    this.emitCounter += delta;
    while(this.emitCounter > this.emitPeriod && this.t <= this.duration){
        this.emitCounter -= this.emitPeriod;
        
        var particle = this.__generateParticle();
        this.__particles.push(particle);
    }
};



SmokeEmitter.prototype.isExpired = function(){
    return this.duration > 0 &&
           this.t > this.duration &&
           this.__particles.length === 0;
};



SmokeEmitter.prototype.__generateParticle = function(){
    var particle = new SmokeParticle({x: this.x,
                                      y: this.y,
                                      radius: 6,
                                      speed: Math.random() * 25 + 5, /* TODO: Magic Values, parameterise these. */
                                      angle: Math.random() * 2 * Math.PI,
                                      duration: this.emitPeriod * 50});
    
    return particle;
};



SmokeEmitter.prototype.render = function(ctx){
    //this.__particles.forEach(function(p){
    //    p.render(ctx);
    //});
    var oldFillStyle = ctx.fillStyle;
    var oldStrokeStyle = ctx.strokeStyle;
    var oldAlpha = ctx.globalAlpha;
    
    ctx.lineWidth = 0;
    for(var i = 0; i < this.__particles.length; i++){
        this.__particles[i].render(ctx);
    }
    
    
    
    ctx.globalAlpha = oldAlpha;
    ctx.fillStyle = oldFillStyle;
    ctx.strokeStyle = oldStrokeStyle;
};






function SmokeParticle(args){
    GameObject.call(this, args);
    
    this.radius = args.radius || 15;
    this.fillColor = args.fillColor || "#008800";
    this.opacityFunction = args.opacityFunction || linear_decrease;
    this.radiusFunction = args.radiusFunction || sqrt_high_decrease;
    
    this.t = 0; // in [0, 1]
    this.duration = args.duration;
    
    if(this.duration <= 0){
        throw new "Invalid Particle duration!";
    }
};
SmokeParticle.prototype = new GameObject();



SmokeParticle.prototype.tick = function(delta){
    this.t += delta / this.duration;
    this.move(delta);
};



SmokeParticle.prototype.isExpired = function(){
    return this.duration > 0 && this.t > 1;
};



SmokeParticle.prototype.render = function(ctx){
    var opF = this.opacityFunction(this.t);
    var rF = this.radiusFunction(this.t);
    
    var radius = Math.max(2, this.radius * rF);
    
    
    // Draw Circle of Radius
    ctx.beginPath();
    ctx.globalAlpha = 0.7 * opF;
    ctx.fillStyle = this.fillColor;
    ctx.lineWidth = 0;
    ctx.arc(this.x,
            this.y,
            radius,
            0,
            2 * Math.PI,
            false);
    ctx.fill();
};
