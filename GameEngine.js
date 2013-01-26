var GameEngineStates = {PAUSED:  0,
                        RUNNING: 1,
                        LOST:    2,
                        WON:     4};

var GAME_HEIGHT = 640;
var GAME_WIDTH = 480;

var MAX_MONSTER_COUNT = 10;
var DEFAULT_HERO_ARGS = {id:0, x:GAME_WIDTH/2, y:GAME_HEIGHT/2, visibility:1, damage:0, polyCoords:[]};

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

    this.assetManager = new AssetManager();
    // TODO need map initialisation

    this.hero = new Hero(DEFAULT_HERO_ARGS); // TODO need initialisation
    this.monsters = [];
    this.traps = [];

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
    this.assetManager.queueDownload("sprite/test.png"); // TODO load real assets
    this.assetManager.downloadAll(function(){
        var x = GAME_WIDTH/2, y = GAME_HEIGHT/2;
        var hero_sprite = that.assetManager.getAsset("sprite/test.png");

        that.context.drawImage(hero_sprite,x-hero_sprite.width/2,y-hero_sprite.height/2);
    });
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
    this.clearWorld();

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
    while(this.monsters.length < MAX_MONSTER_COUNT){
        // Spawn a monster somewhere random on the map.
        var id = "monster" + ("000" + this.__unit_counter).slice(-3);
        this.__unit_counter++;
    
    //     var rds = this.cityMap.getRoads();
    //     var rd = rds[Math.floor(Math.random() * rds.length)];
    //     var rdBBox = rd.getBoundingBox();
        
    //     var cx, cy;
    //     if(rd.isVertical){
    //         cx = rdBBox[0] + rdBBox[2] / 2;
    //         cy = rdBBox[1] + CIVILIAN_SQUARE_HALFWIDTH + Math.random() * (rdBBox[3] - 2*CIVILIAN_SQUARE_HALFWIDTH);
    //     } else {
    //         cx = rdBBox[0] + CIVILIAN_SQUARE_HALFWIDTH + Math.random() * (rdBBox[2] - 2*CIVILIAN_SQUARE_HALFWIDTH);
    //         cy = rdBBox[1] + rdBBox[3] / 2;
    //     }
    //     var civ = new Civilian({id: id, x: cx, y: cy});
        
    //     civ.setCurrentRoad(rd);
    //     civ.setCurrentRoad(rd);
        
    //     civ.setDestinationPoint([cx, cy]);
        
    //     civ.setMoveAngle(rd.isVertical ? [Math.PI / 2, 3 * Math.PI / 2][Math.floor(Math.random()*2)] :
    //                                      [0, Math.PI][Math.floor(Math.random()*2)]);
        
    //     this.civilians.push(civ);
    //     this.movable.push(civ);
    //     this.renderable.push(civ);
    }
    
    this.__updateFocusComboBox();
};





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
    // if(this.monsters.length === 0){
    //     this.gameState = GameEngineStates.WON;
    // }
    
    // The game is lost if the hero has no more health 
    if(this.hero.getHealth() <= 0){
        this.gameState = GameEngineStates.LOST;
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
                bullet.damage(z);
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
    this.handlePlayerInput(delta);
    this.__moveBullets(delta);

    // Move Monsters
    this.monsters.forEach(function(monsters){
        do_monster_move(delta, zombie, this.cityMap, inflrs);
    }.bind(this));

    // Remove dead monsters
    var expiredMonsters = this.monsters.filter(function(monsters){
        return monster.isExpired();
    });
    expiredMonsters.forEach(function(monster){
        this.removeObject(monster);
        removeFromList(monster, this.monsters);
    }.bind(this));


    // Move Traps
    this.traps.forEach(function(trap){
        do_trap_move(delta, trap, this.map);
    }.bind(this));


    // Check collisions
    this.__checkCollisions();
    //this.__checkCollisionsNaive();
};



GameEngine.prototype.__checkCollisions = function(){
    /*
      The idea is that we check for collisions only
       for units which are 'close' to each other by
       dividing the map into grid squares.
    */

    var grid_width = 30;
    var grid_height = grid_width;
    
    var num_bucket_cols = Math.ceil(GAME_WIDTH / grid_width);
    var num_bucket_rows = Math.ceil(GAME_HEIGHT / grid_height);
    
    var arr = [];
    
    // Initialise our 'buckets'
    for(var i = 0; i <= num_bucket_rows; i++){
        arr[i] = [];
        for(var j = 0; j <= num_bucket_cols; j++){
            arr[i][j] = [];
        }
    }
    
    // Go through units, adding them to the appropriate list(s).
    this.gameObjects.forEach(function(m){
        var bbox = m.getBoundingBox();
        
        var gridColLeft = Math.floor(bbox[0] / grid_width);
        var gridColRight = Math.ceil((bbox[0] + bbox[2]) / grid_width);
        
        var gridRowTop = Math.floor(bbox[1] / grid_height);
        var gridRowBottom = Math.ceil((bbox[1] + bbox[3]) / grid_height);
        
        // Add to arrays as necessary
        arr[gridRowTop][gridColLeft].push(m);
        
        if(gridColRight > gridColLeft){ arr[gridRowTop][gridColRight].push(m); }
        if(gridRowBottom > gridRowTop){ arr[gridRowBottom][gridColLeft].push(m); }
        if(gridColRight > gridColLeft &&
           gridRowBottom > gridRowTop){ arr[gridRowBottom][gridColRight].push(m); }
    });
    
    
    // Now check for collisions in each of the 'buckets'.
    for(var i = 0; i < num_bucket_rows; i++){
        for(var j = 0; j < num_bucket_cols; j++){
            this.__checkCollisionsInArray(arr[i][j]);
        }
    }
};



GameEngine.prototype.__checkCollisionsInArray = function(arr){
    // Check for collisions with every unit in the array
    //  against every other unit in the array.
    for(var i = 0; i < arr.length; i++){
        if(arr[i]){
            var mover = arr[i];
                    
            if(arr[i].removed){ continue; }

            if(mover.collidesWith){
                for(var j = 0; j < arr.length; j++){
                    if(i === j) continue;

                    var other = arr[j];
                    
                    if(arr[j].removed){ continue; }

                    if(mover.collidesWith(other)){
                        this.handleCollision(mover, other);
                    }
                }
            }
        }
    }
}



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
        obj1.setHealth(obj1.getHealth()-obj2.getDamage());
     }else{
        // Monster-Hero
        obj2.setHealth(obj2.getHealth()-obj1.getDamage());
     }
   }else if(obj1 instanceof Trap){
     if(obj2 instanceof Monster){
       // Trap-Monster
       obj2.setHealth(obj2.getHeath()-obj1.getDamage());
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
        if(obj === list[i] || obj.equals(list[i])){
            list.splice(i, 1);
            return;
        }
    }
    if(list.length >= oldLength){
        throw "Error! Couldn't remove " + obj + " from List";
    }
}



GameEngine.prototype.removeObject = function(gameObj){
    if(!gameObj.equals){
        throw "Expects object to have equals functionality.";
    }

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
   // Keycode: 37 Left , 38 Up, 39 Right, 40 Down

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
};



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
    // ctx.fillStyle = "#AAAAAA";
    // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //this.cityMap.render(ctx);
   
    // Draw (Renderable) Units
    for(var i = 0; i < this.gameObjects.length; i++){
        if(this.gameObjects[i]){
            this.gameObjects[i].render(ctx);
        }
    }
   
    
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
        return { top: _y, left: _x };
    }
    offset = getOffset(this.canvas);
    
    this.mouseX = ev.x - offset.left;
    this.mouseY = ev.y - offset.top;
};

function Timer(){
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function(){
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    this.wallLastTimestamp = wallCurrent;
    return gameDelta;
}