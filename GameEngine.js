var GameEngineStates = {PAUSED:  0,
                        RUNNING: 1,
                        LOST:    2,
                        WON:     4};

var GAME_HEIGHT = 640;
var GAME_WIDTH = 480;

var MAX_MONSTER_COUNT = 10;

var MAX_DELTA = 0.5;
var DEBUG_SHOW_FRAMERATE = true;

/**
* An object to look after game animation/movement.
*/
function GameEngine(canvas){
    this.context;
    this.mouseX = -1;
    this.mouseY = -1;
    this.keysPressed = [];
    this.gameObjects = [];
    this.gamePaused = true;
    this.gameState = GameEngineStates.PAUSED;

    this.gamet = 0;
    this.gameBeatInterval = 15;

    this.assetManager = new AssetManager();
    this.audioManager = new AudioManager();
    // TODO need map initialisation

    this.hero = new Hero(); // TODO need initialisation
    this.heart = null;
    this.map = createDefaultMap();
    this.monsters = [];
    this.traps = [];
    this.gore = [];
    this.backgroundgore = [];

    this.bullets = [];
    this.gameSpeed = 1;
    
    this.__unit_counter = 0;
    this.__debugEnabled = false;

    // this.myTick = this.tick.bind(this);
    this.timer = new Timer();
}



/*
 Sets up the GameEngine with the document and supplied canvas.
*/
GameEngine.prototype.init = function(canvas){
    var that = this;
    this.setCanvas(canvas);
    this.debugCanvas = null;
    this.debugContext = null;

    document.onkeyup = this.keyup.bind(this);
    document.onkeydown = this.keydown.bind(this);
    
    //document.onmousemove = this.canvasMouseMove.bind(this);
    canvas.onmousedown = this.canvasMouseDown.bind(this);
    canvas.onmousemove = this.canvasMouseMove.bind(this);

    // load the image assets
    var imageAssets = ["sprite/trap3 600x200.png",
                        "sprite/Hero sprites.png",
                        "sprite/Monster 1 complete Sprite.png",
                        "sprite/Monster 1 Sprite.png",
                        "sprite/Dungeonbg.png",
                        "sprite/healthbarred.png",
                        "sprite/healthheart 260x130.png",
                        "sprite/bloodburst.png"
                        ];    
    imageAssets.forEach(function(path){that.assetManager.queueDownload(path);});
    this.assetManager.downloadAll(function(){});

    // load the audio assets
    var audioAssets = [];
    audioAssets.forEach(function(path){that.audioManager.queueDownload(path);});
    this.audioManager.downloadAll(function(){});

    // add the traps
    this.spawnTraps();
    this.spawnHero();
    this.spawnMonsters();
    this.spawnHeart();
};


GameEngine.prototype.setCanvas = function(c){
    this.canvas = c;
    this.context = c.getContext("2d");
};



GameEngine.prototype.setDebugCanvas = function(c){
    this.debugCanvas = c;
    this.debugContext = c.getContext("2d");
}



GameEngine.prototype.clearWorld = function(){
    this.gameObjects = [];

    this.hero = new Hero(); // TODO need initialisation
    this.monsters = [];
    this.traps = [];

    this.bullets = [];
    this.gameSpeed = 1;
}



// Sets up a game world.
GameEngine.prototype.newGame = function(){
    //this.clearWorld();

    this.gameState = this.gamePaused ? GameEngineStates.PAUSED : GameEngineStates.RUNNING;
};



GameEngine.prototype.pause = function(){
    this.gamePaused = true;
    this.gameState = GameEngineStates.PAUSED;
}




/*
    For Game setup, populate the map with some amount of humans.
*/

GameEngine.prototype.__populateMapWithMonsters = function(){
    if (((Math.floor(this.hero.getHealth()) == 666) ||
        (Math.floor(this.hero.getHealth()) == 333)) && (this.monsters.length <= MAX_MONSTER_COUNT)) {
        this.spawnMonsters();
    }
                // while(this.monsters.length < MAX_MONSTER_COUNT){
                //     // Spawn a monster somewhere random on the map.
                //     var id = "monster" + ("000" + this.__unit_counter).slice(-3);
                //     this.__unit_counter++;


                // //     var rds = this.cityMap.getRoads();
                // //     var rd = rds[Math.floor(Math.random() * rds.length)];
                // //     var rdBBox = rd.getBoundingBox();
                    
                // //     var cx, cy;
                // //     if(rd.isVertical){
                // //         cx = rdBBox[0] + rdBBox[2] / 2;
                // //         cy = rdBBox[1] + CIVILIAN_SQUARE_HALFWIDTH + Math.random() * (rdBBox[3] - 2*CIVILIAN_SQUARE_HALFWIDTH);
                // //     } else {
                // //         cx = rdBBox[0] + CIVILIAN_SQUARE_HALFWIDTH + Math.random() * (rdBBox[2] - 2*CIVILIAN_SQUARE_HALFWIDTH);
                // //         cy = rdBBox[1] + rdBBox[3] / 2;
                // //     }
                // //     var civ = new Civilian({id: id, x: cx, y: cy});
                    
                // //     civ.setCurrentRoad(rd);
                // //     civ.setCurrentRoad(rd);
                    
                // //     civ.setDestinationPoint([cx, cy]);
                    
                // //     civ.setMoveAngle(rd.isVertical ? [Math.PI / 2, 3 * Math.PI / 2][Math.floor(Math.random()*2)] :
                // //                                      [0, Math.PI][Math.floor(Math.random()*2)]);
                    
                // //     this.civilians.push(civ);
                // //     this.movable.push(civ);
                // //     this.renderable.push(civ);
                // }
                
                // this.__updateFocusComboBox();
};

//Hans
GameEngine.prototype.spawnMonsters = function(){
    console.log('Spawning Monsters');
    var that = this;

    // Spawn the monster near a 'carrot', which is map
    var path = this.map.paths[Math.floor(Math.random() * this.map.paths.length)];
    var ct = Math.random();
    var cpt = Geometry.evaluateCurve(path.curve, ct);
    var carrot = {pt: cpt,
                  speed: 0,
                  t: ct,
                  path: path};
    
    var DEFAULT_MONSTER_ARGS = {
        id:0, 
        x:cpt[0], 
        y:cpt[1], 
        visibility:1, 
        damage:5, 
        scale:0.3,
        carrot: carrot,
        spriteSheet:(function(){
            var monster_sprite = that.assetManager.getAsset("sprite/Monster 1 complete Sprite.png");
            var monster_ss = new SpriteSheet({
                image:monster_sprite,
                width:200,
                height:200,
                cols:4,
                rows:4,
                sprites:[{name:'up1'},{name:'up2'},{name:'up3'},{name:'up4'},
                         {name:'dn1'},{name:'dn2'},{name:'dn3'},{name:'dn4'},
                         {name:'lf1'},{name:'lf2'},{name:'lf3'},{name:'lf4'},
                         {name:'rg1'},{name:'rg2'},{name:'rg3'},{name:'rg4'}]});
            return monster_ss;
        })()
    };

    var monster = new Monster(DEFAULT_MONSTER_ARGS);
    that.gameObjects.push(monster);
    monster.deactivate();
    this.monsters.push(monster);
    console.log(this.monsters);
    console.log("Finished spawning monster");
}


GameEngine.prototype.spawnTraps = function(){
    console.log('Spawning Traps');
    var that = this;
    var MAX_AMT_TRAPS = 3;
    var maxAmtTrapsSq = MAX_AMT_TRAPS*MAX_AMT_TRAPS;
    var scaleX = Math.floor(600/MAX_AMT_TRAPS);
    var scaleY = Math.floor(440/MAX_AMT_TRAPS);

    for (var i = 0; i < MAX_AMT_TRAPS; i++){
        for (var j = 0; j < MAX_AMT_TRAPS; j++){
            var trap_sprite = that.assetManager.getAsset("sprite/trap3 600x200.png");
            var trap_ss = new SpriteSheet({
                image:trap_sprite,
                width:200,
                height:200,
                sprites:[{name:'neutral',x:0, y:0},{name:'reset'},{name:'ready'}]});
            var trap_animation = new Animation({
                spriteSheet:trap_ss,
                animation:[{spriteName:'neutral',length:0.1},
                           {spriteName:'reset',length:0.1},
                           {spriteName:'ready',length:0.5}],
                repeat:true,
                keyFrame:0
            });
            var randomX = Math.floor((Math.random()+i)*scaleX);
            var randomY = Math.floor((Math.random()+j)*scaleY);

            var trap = new Trap({
                id : 'trap1', 
                x : randomX,
                y : randomY,
                speed : 0,
                max_speed : 0,
                visibility : 1,
                damage : 10,
                prevX : GAME_WIDTH/2,
                prevY : GAME_HEIGHT/2,
                scale : 0.2,
                animation : trap_animation
            });
            trap.deactivate();
            this.gameObjects.push(trap);
            this.traps.push(trap);
        }
    }

    //var result = this.traps.map(function(trap) { return {x:trap.x,y:trap.y};});
    //console.log(result);
    console.log(this.traps);
    console.log("Finished spawning traps");
}

GameEngine.prototype.spawnHeart = function() {
    var heart_sprite = this.assetManager.getAsset("sprite/healthheart 260x130.png");
    var heart_ss = new SpriteSheet({
        image:heart_sprite,
        width:130,
        height:130,
        sprites:[{name:'systole',x:0, y:0},{name:'diastole'}]});
    var heart_animation = new Animation({
        spriteSheet:heart_ss,
        animation:[{spriteName:'systole',length:0.1},
                   {spriteName:'diastole',length:0.5}],
        repeat:true,
        keyFrame:0
    });
    this.heart = heart_animation;
};


GameEngine.prototype.spawnHero = function(){
    var that = this;
    var DEFAULT_HERO_ARGS = {
        id:0, 
        x:GAME_WIDTH/2, 
        y:GAME_HEIGHT/2, 
        visibility:1, 

        damage:0, 
        scale:0.3, 
        spriteSheet:(function(){
            var hero_sprite = that.assetManager.getAsset("sprite/Hero sprites.png");
            var hero_ss = new SpriteSheet({
                image:hero_sprite,
                width:200,
                height:200,
                cols:3,
                rows:4,
                sprites:[{name:'up1'},{name:'up2'},{name:'up3'},
                         {name:'dn1'},{name:'dn2'},{name:'dn3'},
                         {name:'lf1'},{name:'lf2'},{name:'lf3'},
                         {name:'rg1'},{name:'rg2'},{name:'rg3'}]});
            return hero_ss;
        })()
    };

    that.hero = new Hero(DEFAULT_HERO_ARGS);
    that.gameObjects.push(this.hero);
}


// Start/Resume game animation.
GameEngine.prototype.start = function(){
    var that = this;
    if(this.gamePaused){
        this.gamePaused = false;
        this.gameState = GameEngineStates.RUNNING;
        (function gameloop(){
            that.tick();
            requestAnimationFrame(gameloop,that.canvas);
        })();
    }
};



GameEngine.prototype.tick = function tick(){
    var delta = this.timer.tick();
    
    // we're only using .gameSpeed as a "debug" feature
    // at this stage.
    if(this.__debugEnabled){ delta *= this.gameSpeed; }
    
    // for framerate
    this.__fps = 1000 / delta;

    this.move(delta);
    
    this.__checkGameTerminationConditions();
    this.render(this.context);
    
    if(this.__debugEnabled && this.debugContext){
        this.renderDebugCanvas(this.debugContext);
    }
    
    this.gamet += 1;
    //Call function again
    // if(!this.gamePaused){
    //     window.setTimeout(this.myTick, 10, time);
    // }
};



/*
  Checks whether the game has yet been won or lost.
*/
GameEngine.prototype.__checkGameTerminationConditions = function(){
    // The game is won if there are no more monsters
    if(this.monsters.length === 0 && this.hero.getHealth()<300){
        this.gameState = GameEngineStates.WON;
        this.timer.stop();
    }
    
    // The game is lost if the hero has no more health 
    if(this.hero.getHealth() <= 0){
        this.gameState = GameEngineStates.LOST;
        this.timer.stop();
    }
};



GameEngine.prototype.__moveBullets = function(delta){
    for(var i = 0; i < this.bullets.length; i++){
        var bullet = this.bullets[i];
        bullet.move(delta);

        // NOTE: Here we assume Bullets only damage Zombies.
        for(var j = 0; j < this.monsters.length; j++){
            if(!this.monsters[j]){ continue; }

            var z = this.monsters[j];
            if(bullet.hits(z)){
                break;
            }
        }
    }
    var expiredBullets = this.bullets.filter(function(bullet){
        return bullet.isExpired();
    });
    expiredBullets.forEach(function(bullet){
        removeFromList(bullet, this.bullets);
    }.bind(this));
};



/*
 Move game entities, and check collisions.
 O(n^2)
*/
GameEngine.prototype.move = function(delta){
    var that = this;
    that.handlePlayerInput(delta);
    this.__moveBullets(delta);

    // Move Monsters
    this.monsters.forEach(function(monster){
        monster.move(delta, that.hero);
    }.bind(this));

    // Remove dead monsters
    var expiredMonsters = this.monsters.filter(function(monster){
        return monster.isExpired();
    });
    expiredMonsters.forEach(function(monster){
        this.removeObject(monster);
        removeFromList(monster, this.monsters);
    }.bind(this));

    // Move Traps
    this.traps.forEach(function(trap){
        trap.move(delta, trap, this.map);
    }.bind(this));

    // Check collisions
    this.__checkCollisions();
    //this.__checkCollisionsNaive();
    this.hero.move(delta);
    this.heart.update(delta);

    // Move Gore
    this.gore.forEach(function(blood){blood.gore.update(delta);});

    this.__populateMapWithMonsters();
};

GameEngine.prototype.__checkCollisions = function(){
    //return; // TODO 
    /*
      The idea is that we check for collisions only
       for units which are 'close' to each other by
       dividing the map into grid squares.
    */

                        // var grid_constant = 30;
                        
                        // var num_bucket_cols = Math.ceil(GAME_WIDTH / grid_constant);
                        // var num_bucket_rows = Math.ceil(GAME_HEIGHT / grid_constant);
                        
                        // var arr = [];
                        
                        // // Initialise our 'buckets'
                        // for(var i = 0; i <= num_bucket_rows; i++){
                        //     arr[i] = [];
                        //     for(var j = 0; j <= num_bucket_cols; j++){
                        //         arr[i][j] = [];
                        //     }
                        // }
                        
    // Go through units, adding them to the appropriate list(s).
    var arr = [];
    var c = 0;

    this.gameObjects.forEach(function(m){
        arr[c] = m;
        c++;
    });
    
    
    // Now check for collisions in each of the 'buckets'.
    for(var i = 0; i < arr.length; i++){
        for(var j = i+1; j < arr.length; j++){
            var xVal = arr[i].x-arr[j].x;
            var xValSq = xVal*xVal;
            var yVal = arr[i].y-arr[j].y;
            var yValSq = yVal*yVal;
            var dist = xValSq + yValSq;
            if (dist < 500){
                this.handleCollision(arr[i], arr[j]);
            }
        }
    }
};



                        // GameEngine.prototype.__checkCollisionsInArray = function(arr){
                        //     // Check for collisions with every unit in the array
                        //     //  against every other unit in the array.
                        //     for(var i = 0; i < arr.length; i++){
                        //         if(arr[i]){
                        //             var mover = arr[i];
                                            
                        //             if(arr[i].removed){ continue; }

                        //             if(mover.arr[j]){
                        //                 for(var j = 0; j < arr.length; j++){
                        //                     if(i === j) continue;

                        //                     var other = arr[j];
                                            
                        //                     if(arr[j].removed){ continue; }

                        //                     if(mover.collidesWith(other)){
                        //                         this.handleCollision(mover, other);
                        //                     }
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }



GameEngine.prototype.__checkCollisionsNaive = function(){
    this.__checkCollisionsInArray(this.movable);
}



GameEngine.prototype.handleCollision = function(obj1, obj2){
   // Resolve collision between Hero, Monster and traps
   // Monster damages HERO
   if(obj1 instanceof Monster){
     if(obj2 instanceof Monster){
       // Monster-monster do nothing 
       // Might want to do collision for them
     }else if(obj2 instanceof Trap){
        // Monster-Trap
        if(obj2.isActive){
            obj1.setHealth(obj1.getHealth()-obj2.getDamage());
           this.spawnGoreAnimation(obj2.getX(),obj2.getY(),1);
           this.spawnGoreAnimation(obj2.getX()+Math.random()*15,obj2.getY()+Math.random()*15,1);
           this.spawnGoreAnimation(obj2.getX()-Math.random()*30,obj2.getY()+Math.random()*30,1);
        }
     }else{
        // Monster-Hero
        obj2.setHealth(obj2.getHealth()-obj1.getDamage());
     }
   }else if(obj1 instanceof Trap){
     if(obj2 instanceof Monster){
       // Trap-Monster
       if(obj1.isActive){
           obj2.setHealth(obj2.getHealth()-obj1.getDamage());
           this.spawnGoreAnimation(obj2.getX(),obj2.getY(),1);
           this.spawnGoreAnimation(obj2.getX()+Math.random()*15,obj2.getY()+Math.random()*15,1);
           this.spawnGoreAnimation(obj2.getX()-Math.random()*30,obj2.getY()+Math.random()*30,1);
       }
     }else if(obj2 instanceof Trap){
        // Trap-Trap
        // This shld not happen
     }else{
        // Trap-Hero
        // Nothing should happen
     }
   }else{
     if(obj2 instanceof Monster){
        // Hero-Monster
        obj1.setHealth(obj1.getHealth()-obj2.getDamage());
     }else if(obj2 instanceof Trap){
        // Hero-Trap
        // Nothing should happen
     }else{
        // Hero-Hero
        // This shld not happen
     }
   }
};




// Creates an explosion as well as removing it
GameEngine.prototype.destroyObject = function(movingObj){
    // Simulate game effects from destroying the object,
    // before we remove it from the game. (e.g. drop an item).

    this.removeObject(movingObj);
};



//TODO: Fix this.
//TODO: Augment into array prototype?
function removeFromList(obj, list){
    var oldLength = list.length;
    for(var i = 0; i < list.length; i++){
        if(obj === list[i] ){ //|| obj.equals(list[i])){
            list.splice(i, 1);
            return;
        }
    }
    if(list.length >= oldLength){
        throw "Error! Couldn't remove " + obj + " from List";
    }
}



GameEngine.prototype.removeObject = function(gameObj){
                    // if(!gameObj.equals){
                    //     throw "Expects object to have equals functionality.";
                    // }

    removeFromList(gameObj, this.gameObjects);
    
    // This fixes a bug wherein we when checking collisions,
    // an object might have been removed more than once.
    gameObj.removed = true;
}



// Wrap around world
GameEngine.prototype.ensureWithinBounds = function(obj){
    var x = obj.getX();
    var y = obj.getY();
    var prevX = obj.getPreviousX();
    var prevY = obj.getPreviousY();

    if(x < 0){
        obj.setX(prevX + this.canvas.width);
        obj.setX(x + this.canvas.width);
    }
    if(x > this.canvas.width){
        obj.setX(prevX - this.canvas.width);
        obj.setX(x - this.canvas.width);
    }
    if(y < 0){
        obj.setY(prevY + this.canvas.height);
        obj.setY(y + this.canvas.height);
    }
    if(y > this.canvas.height){
        obj.setY(prevY - this.canvas.height);
        obj.setY(y - this.canvas.height);
    }
};


/*
Control the Hero's movement with the keypresses
*/
GameEngine.prototype.handlePlayerInput = function(delta){
   // Keycode: 37 Left , 38 Up, 39 Right, 40 Down, 32 Space

   if(this.keysPressed[37] && !this.keysPressed[39]){
     // console.log("Going Left");
     this.hero.moveLeft(delta);
   }
   if(!this.keysPressed[37] && this.keysPressed[39]){
     // console.log("Going Right");
     this.hero.moveRight(delta);
   }
   if(this.keysPressed[38] && !this.keysPressed[40]){
     // console.log("Going Up");
     this.hero.moveUp(delta);
   }
   if(!this.keysPressed[38] && this.keysPressed[40]){
     // console.log("Going Down");
     this.hero.moveDown(delta);
   }
   if(this.keysPressed[32]){
     this.__checkTrapActivation();
   }
};



GameEngine.prototype.__checkTrapActivation = function(){
    var h = this.hero;
    var close_traps = this.traps.filter(function(trap){return ((h.getDistanceToUnit(trap)<50 && !trap.isActive)?true:false);});
    if(close_traps.length>1){
        console.log("This shouldn't be happening. Hero is too close to 2 traps");
    }
    if(close_traps[0]){
        close_traps[0].activate();
        h.setHealth(h.getHealth()-close_traps[0].damage);
    }
}


GameEngine.prototype.__debugFocusNextUnit = function(){
    var oldSelectedID = $("#debugCameraUnitFocus_combo option:selected").val();
    var newSelIndex = 0;
    
    var comboBox = document.getElementById("debugCameraUnitFocus_combo");
    if(!comboBox){
        throw "Could not find debug Camera Focus combobox!";
    }
    
    var i;
    var children = comboBox.getElementsByTagName("option");
    for(i = 1; i < children.length && (i - 1) < this.movable.length; i++){
        if(this.movable[i - 1].id === oldSelectedID){
            newSelIndex = i;
        }
        
    }
    
    var nextSelectedIndex = (newSelIndex % this.movable.length) + 1; 
    
    console.log("NextFocus::" + oldSelectedID + "@" + newSelIndex + " -> " + nextSelectedIndex + " of " + children.length);
    
    children[nextSelectedIndex].selected = true;
    debugCameraUnitFocus_div.getElementsByClassName("ui-combobox-input")[0].value = this.movable[nextSelectedIndex - 1].id;
};



GameEngine.prototype.__debugFocusPrevUnit = function(){
    var oldSelectedID = $("#debugCameraUnitFocus_combo option:selected").val();
    var newSelIndex = 0;
    
    var comboBox = document.getElementById("debugCameraUnitFocus_combo");
    if(!comboBox){
        throw "Could not find debug Camera Focus combobox!";
    }
    
    var i;
    var children = comboBox.getElementsByTagName("option");
    for(i = 1; i < children.length && (i - 1) < this.movable.length; i++){
        if(this.movable[i - 1].id === oldSelectedID){
            newSelIndex = i;
        }
    }
    
    var nextSelectedIndex = (newSelIndex - 2 % this.movable.length) + 1; 
    
    children[nextSelectedIndex].selected = true;
    debugCameraUnitFocus_div.getElementsByClassName("ui-combobox-input")[0].value = this.movable[nextSelectedIndex - 1].id;
};



GameEngine.prototype.__updateFocusComboBox = function(){
    if(!this.__debugEnabled){
        return;
    }

    // Update Unit IDs to Debug Camera Focus combobox
    var oldSelectedID = $("#debugCameraUnitFocus_combo option:selected").val();
    var newSelIndex = 0;
    
    // We just rename the <option> elements in the combobox,
    //  and delete any additional comboboxes left over.
    var comboBox = document.getElementById("debugCameraUnitFocus_combo");
    
    if(!comboBox){
        throw "Could not find debug Camera Focus combobox!";
    }
    
    var i = 1;
    var children = comboBox.getElementsByTagName("option");
    
    while(children.length < this.movable.length + 1){
        var newOpt = document.createElement("option");
        comboBox.appendChild(newOpt);
        children = comboBox.getElementsByTagName("option");
    }
    
    children[0].value = "None";
    children[0].innerHTML = "None";
    for(i = 1; i < children.length && (i - 1) < this.movable.length; i++){
        if(this.movable[i - 1].id === oldSelectedID){
            newSelIndex = i;
        }
        
        children[i].value = this.movable[i - 1].id;
        children[i].innerHTML = this.movable[i - 1].id;
        
    }
    
    //while(children.length + 1 > this.movable.length){
    //    comboBox.removeChild(children[children.length - 1]);
    //    children = comboBox.getElementsByTagName("option");
    //}
    
    if(newSelIndex >= 1){
        children[newSelIndex].selected = true;
        debugCameraUnitFocus_div.getElementsByClassName("ui-combobox-input")[0].value = this.movable[newSelIndex - 1].id;
    } else {
        debugCameraUnitFocus_div.getElementsByClassName("ui-combobox-input")[0].value = "None";
    }
};



GameEngine.prototype.updateUI = function(){
};



/*
 Render objects to canvas' context.
*/
GameEngine.prototype.render = function(ctx){
    this.updateUI();
    
    // Fill Background, and CityMap/Roads
    var bg = this.assetManager.getAsset("sprite/Dungeonbg.png");
    ctx.drawImage(bg,0,0);
    // ctx.fillStyle = "#AFAFAF";
    // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //this.cityMap.render(ctx);
    //////////////////////////////////////////////////////////////////////////                                TO SHOW PATH
    //this.map.renderMapPathData(ctx);
    // Draw background gore
    for(var i = 0; i < this.backgroundgore.length; i++){
        this.backgroundgore[i].gore.render(ctx,this.backgroundgore[i].x,this.backgroundgore[i].y,0.2,1);
    }
     
    // Draw traps
    var MAX_LOS = 150;
    for(var i = 0; i < this.traps.length; i++){
        if(this.traps[i]){
            var dist = this.hero.getDistanceToUnit(this.traps[i]);
            if(this.traps[i].isActive){
                this.traps[i].render(ctx);
            } else {
                if(dist<MAX_LOS){
                    this.gameObjects[i].setVisibility((MAX_LOS-dist)/MAX_LOS);
                    this.gameObjects[i].render(ctx);
                } else {
                    // Don't render them
                }
            }
        }
    }

    // Draw the monsters
    for(var i = 0; i < this.monsters.length; i++){
        this.monsters[i].render(ctx);
    }

    // Draw the health bar
    var hp_bar = this.assetManager.getAsset("sprite/healthbarred.png");
    var change = 420*(1000-this.hero.getHealth())/1000;
    ctx.drawImage(hp_bar,2,20+change,20,420-change);


    // Draw the heart
    this.heart.render(ctx,0,Math.min(400,change+20),0.2,1);
    var speed = 2-this.hero.getHealth()/1000;
    this.heart.setSpeed(speed);

    // Draw the hero 
    this.hero.render(ctx);
    
    // Draw the Gore
    var temp = [];
    for(var i = 0; i < this.gore.length; i++){
        this.gore[i].gore.render(ctx,this.gore[i].x,this.gore[i].y,0.2,1);
        if(this.gore[i].gore.getIndex()==4){
            this.backgroundgore.push(this.gore[i]);
        }else{
            temp.push(this.gore[i]);
        }
    }

    this.gore = temp;

    //
    // Text rendering
    //
    
    // Preserve old values
    var oldFont = context.font;
    var oldTextAlign = context.textAlign;
    
    // Render framerate, if needed.
    if(DEBUG_SHOW_FRAMERATE){
        context.font = 'italic 13px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'left';
        var frameRateStr = (this.__fps).toString().slice(0, 5);
        context.fillText("FPS:" + frameRateStr, 5, 15);
    }
    
    
    // If we have won or lost, then draw that we have won or lost.
    if(this.gameState === GameEngineStates.WON){
        context.font = 'italic 56px Arial';
        context.fillStyle = 'green';
        context.textAlign = 'center';
        context.fillText("Game Won", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
    if(this.gameState === GameEngineStates.LOST){
        context.font = 'italic 56px Arial';
        context.fillStyle = 'red';
        context.textAlign = 'center';
        context.fillText("Game Lost", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
    
    context.font = oldFont;
    context.textAlign = oldTextAlign;
};



GameEngine.prototype.renderDebugCanvas = function (ctx){
    ctx.save();
    
    var dcw = 320;
    var dch = 240;
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, dcw, dch);
    ctx.stroke();
    
    ctx.translate(dcw/2, dch/2);
    
    // Zoom onto map
    var zoom = debugCameraCanvasZoomSlider.value;
    ctx.scale(zoom, zoom);
    
    // Focus on area...
    var focusUnitId = $("#debugCameraUnitFocus_combo option:selected").val();
    var units = this.movable.filter(function(u){ return u.id === focusUnitId; });
    
    if(units.length > 0){
        var focusUnit = units[0];
        ctx.translate(-(focusUnit.x), -(focusUnit.y));
    } else {
        ctx.translate(-GAME_WIDTH/2, -GAME_HEIGHT/2);
    }
    
    this.render(ctx);
    ctx.restore();
};


// Record key press
GameEngine.prototype.keydown = function(evt){
    var keyCode = (window.event) ? event.keyCode : evt.keyCode;
    this.keysPressed[keyCode] = true;
    evt.preventDefault(); // Prevents the window from scrolling. Seems to only work in Chrome
};



// Record key release
GameEngine.prototype.keyup = function(evt){
    var keyCode = (window.event) ? event.keyCode : evt.keyCode;
    this.keysPressed[keyCode] = false;
    evt.preventDefault(); // Prevents the window from scrolling. Seems to only work in Chrome
};



// Check whether the given keyCode is pressed
GameEngine.prototype.isKeyPressed = function(keyCode){
    return this.keysPressed[keyCode] === true;
};



GameEngine.prototype.canvasMouseDown = function(ev){
    // if(this.currentInfluencer){
    //     // Make smoke emitter
    //     var x = this.currentInfluencer.x;
    //     var y = this.currentInfluencer.y;
    //     var duration = this.currentInfluencer.duration;
    //     var smokeEmitter = new SmokeEmitter({x: x,
    //                                          y: y,
    //                                          emitFrequency: 30,
    //                                          duration: duration * 1.5});
    //     this.smokeEmitters.push(smokeEmitter);
        
    //     this.placedInfluencers.push(this.currentInfluencer);
    //     this.currentInfluencer.t = 0; // reset counter, if it was used.
    //     this.currentInfluencer = null;
    // }
};



// For the canvas only.
GameEngine.prototype.canvasMouseMove = function(ev){
    //console.log("MMV: " + ev + ", " + ev.clientX + ", " + ev.x);
    function getOffset( el ) {
        // From StackOverflow.
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x }
    }
    offset = getOffset(this.canvas);
    
    this.mouseX = ev.x - offset.left;
    this.mouseY = ev.y - offset.top;
};

GameEngine.prototype.spawnGoreAnimation = function(x,y,speed){
    var blood_sprite = this.assetManager.getAsset("sprite/bloodburst.png");
    console.log(blood_sprite);
    var blood_ss = new SpriteSheet({
        image:blood_sprite,
        width:200,
        height:200,
        cols:5,
        rows:1,
        sprites:[{name:'bb1'},{name:'bb2'},{name:'bb3'},{name:'bb4'},{name:'bb5'}]
    });
 
    var blood = new Animation({
        spriteSheet:blood_ss,
        repeat:false,
        keyFrame:0,
        animation:[{spriteName:'bb1',length:0.1},
                   {spriteName:'bb2',length:0.1},
                   {spriteName:'bb3',length:0.1},
                   {spriteName:'bb4',length:0.4},
                   {spriteName:'bb5',length:0.2}]
    });

    blood.setSpeed(speed);
    console.log(blood);
    this.gore.push({gore:blood,x:x,y:y});
}

function Timer(){
    this.gameTime = 0;
    this.maxStep = MAX_DELTA;
    this.wallLastTimestamp = 0;
    this.stopped = false;
}

Timer.prototype.tick = function(){
    if(this.stopped){
        return 0;
    }
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    this.wallLastTimestamp = wallCurrent;
    return gameDelta;
}

Timer.prototype.stop = function(){
    this.stopped = true;
}

