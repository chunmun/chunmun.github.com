function AssetManager(){
	this.successCount = 0;
	this.errorCount = 0;
	this.cache = {};
	this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function(path){
	this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function(){
	return (this.downloadQueue.length == this.successCount + this.errorCount);
}

AssetManager.prototype.downloadAll = function(callback){
	for(var i=0;i < this.downloadQueue.length;i++){
		var path = this.downloadQueue[i];
		var img = new Image();
		var that = this;
		img.addEventListener("load", function(){
			that.successCount++;
			if(that.isDone()){
				callback();
			}
		});

		img.addEventListener("error", function(){
			that.errorCount++;
			if(that.isDone()){
				callback();
			}
		});
		img.src = path;
		this.cache[path] = img;
	}
}

AssetManager.prototype.getAsset = function(path){
	return this.cache[path];
}
/*
AssetManager.queueDownload("img/sprite.png");
AssetManager.downloadAll(function(){
	var x = 0, y = 0;
	var sprite = AssetManager.getAsset("img/sprite.png");

	ctx.drawImage(sprite,x-sprite.width/2,y-sprite.height/2);
}
*/

function AudioManager(args){
	AssetManager.call(this,args);
}

AudioManager.prototype = new AssetManager();

AudioManager.prototype.downloadAll = function(callback){
	for(var i=0;i < this.downloadQueue.length;i++){
		var path = this.downloadQueue[i];
		var sound = new Audio();
		var that = this;
		sound.addEventListener("load", function(){
			that.successCount++;
			if(that.isDone()){
				callback();
			}
		});

		sound.addEventListener("error", function(){
			that.errorCount++;
			if(that.isDone()){
				callback();
			}
		});
		sound.src = path;
		this.cache[path] = sound;
	}
}