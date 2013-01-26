/*
Data Structure for spritesheet assets

Example usage:
var sprites = new SpriteSheet({
    width: 32,
    height: 32,
    sprites: [
        { name: 'stand' },
        { name: 'walk_1', x: 0, y: 1 },
        { name: 'walk_2', x: 0, y: 1 },
    ]
});
*/

var SpriteSheet = function(data) {
    this._sprites = [];
    this._width = 0;
    this._height = 0;
    this._image = null;
 
    this.load(data);
};
 
SpriteSheet.prototype.load = function(data){
    this._height = data.height;
    this._width = data.width;
    this._sprites = data.sprites;
    this._image = data.image;
};
 
SpriteSheet.prototype.getOffset = function(spriteName) {
    //Go through all sprites to find the required one
    for(var i = 0; i < this._sprites.length; i++) {
        var sprite = this._sprites[i];

        if(sprite.name == spriteName) {
            //To get the offset, multiply by sprite width
            //Sprite-specific x and y offset is then added into it.
            return {
                image: this._image,
                x: (i * this._width) + (sprite.x||0),
                y: (sprite.y||0),
                width: this._width,
                height: this._height
            };
        }
    }

    return null;
};

/*
Defines the Animation class that plays the sprite
Example of args.animation = [{spriteName:"walk_1",length:100},{spriteName:"walk_2",length:100}]
*/
var Animation = function(args){
    this.spriteSheet = args.spriteSheet;
    this.spriteAnimation = args.animation || [];
    this.frame = undefined;
    this.index = 0;
    this.elapsed = 0;

    this.repeat = args.repeat || false;
    this.keyFrame = args.keyFrame || 0;
    this.reset();
}

Animation.prototype.reset = function() {
    this.elapsed = 0;
    this.index = this.keyFrame;
    this.frame = this.spriteAnimation[this.index];
};

Animation.prototype.update = function(delta) {
    this.elapsed += delta;

    if(this.elapsed >= this.frame.length){
        this.index++;
        this.elapsed = Math.max(0,this.elapsed - this.frame.length);
    }

    if(this.index >= this.spriteAnimation.length){
       if(this.repeat){
         this.index = this.keyFrame;
       } else {
         this.index--;
       }
    }

    this.frame = this.spriteAnimation[this.index];
};

Animation.prototype.render = function(ctx,x,y){
    console.log(this.index);
    var frame = this.frame;
    var info = this.spriteSheet.getOffset(this.frame.spriteName);
    ctx.drawImage(info.image,info.x,info.y,info.width,info.height,x,y,info.width,info.height);
}