var GameEngineStates = {PAUSED:  0,
                        RUNNING: 1,
                        LOST:    2,
                        WON:     4};

var MAX_ZOMBIE_COUNT = 5;
var MAX_CIVILIAN_COUNT = 100;
var MAX_SOLDIER_COUNT = 3;
var GAME_DEFAULT_NUMBER_ZOMBIES = 20;

var DEBUG_SHOW_FRAMERATE = true;

/**
* An object to look after game animation/movement.
*/
function GameEngine(canvas){
    this.context;
    this.mouseX = -1;
    this.mouseY = -1;
    this.keysPressed = [];
    this.movable = [];
    this.renderable = [];
    this.gamePaused = true;
    this.gameState = GameEngineStates.PAUSED;

    this.cityMap;

    this.zombies = [];
    this.civilians = [];
    this.soldiers = [];
    
    this.numZombiesAvailableToSpawn = GAME_DEFAULT_NUMBER_ZOMBIES;

    this.bullets = [];
    this.smokeEmitters = [];
    this.placedInfluencers = [];
    this.currentInfluencer = null;
    this.zombie_timer = 0;
    this.gameSpeed = 1;
    
    this.__unit_counter = 0;
    this.__debugEnabled = false;

    this.myTick = this.tick.bind(this);
}



/*
 Sets up the GameEngine with the document and supplied canvas.
*/
GameEngine.prototype.init = function(canvas){
    this.setCanvas(canvas);
    this.debugCanvas = null;
    this.debugContext = null;

    document.onkeyup = this.keyup.bind(this);
    document.onkeydown = this.keydown.bind(this);
    
    //document.onmousemove = this.canvasMouseMove.bind(this);
    canvas.onmousedown = this.canvasMouseDown.bind(this);
    canvas.onmousemove = this.canvasMouseMove.bind(this);
    
    count_zombies_lbl.style.color = ZOMBIE_COLOR;
    count_civilians_lbl.style.color = CIVILIAN_COLOR;
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
    this.movable = [];
    this.renderable = [];

    this.zombies = [];
    this.civilians = [];
    this.soldiers = [];
    
    this.numZombiesAvailableToSpawn = GAME_DEFAULT_NUMBER_ZOMBIES;

    this.bullets = [];
    this.smokeEmitters = [];
    this.placedInfluencers = [];
    this.currentInfluencer = null;
    this.zombie_timer = 0;
}



// Sets up a game world.
GameEngine.prototype.newGame = function(){
    this.clearWorld();

    this.gameState = this.gamePaused ? GameEngineStates.PAUSED : GameEngineStates.RUNNING;
    this.cityMap = MAP_GENERATORS[MAP_SELECTED_GENERATOR]();

    this.__populateMapWithCivilians();
    this.__populateMapWithSoldiers();
};



GameEngine.prototype.pause = function(){
    this.gamePaused = true;
    this.gameState = GameEngineStates.PAUSED;
}



GameEngine.prototype.spawnZombie = function(){
    /*
        This spawns a zombie from the start point of the
        first road added to CityMap, (which is the top-left road)
        which is great for the demo-skeleton, but
        isn't nearly so general as should be preferred.
        TODO: Spawning of zombies.
    */
    
    var id = "zombie" + ("000" + this.__unit_counter).slice(-3);
    this.__unit_counter++;
    
    var pt = this.cityMap.spawnpoint;
    var rd = this.cityMap.getRoadAt(pt);
    var zombie = new Zombie({id: id, x: pt[0], y: pt[1] + ZOMBIE_SQUARE_HALFWIDTH + 1}); // Magic value

    zombie.setCurrentRoad(rd);

    //var destPt = Geometry.midpoint(rd.getExitInDirection(ROAD_DIRECTION_SOUTH));
    var isectRd;
    for(var i=0;i<ROAD_DIRECTIONS.length;i++){
        isectRd = rd.getAdjacentRoads()[ROAD_DIRECTIONS[i]]
        if(isectRd instanceof Road){
            var destPt = Geometry.midpoint([isectRd.getStartPoint(), isectRd.getEndPoint()]);
            zombie.setDestinationPoint(destPt);
            zombie.setMoveAngle(3 * Math.PI / 2); //TODO: Need to check what this does
            break;}
    }

    this.zombies.push(zombie);
    this.movable.push(zombie);
    this.renderable.push(zombie);
    
    this.__updateFocusComboBox();
}




/*
    For Game setup, populate the map with some amount of humans.
*/
GameEngine.prototype.__populateMapWithCivilians = function(){
    while(this.civilians.length < MAX_CIVILIAN_COUNT){
        // Spawn a Civilian somewhere random on the map.
        var id = "civilian" + ("000" + this.__unit_counter).slice(-3);
        this.__unit_counter++;
    
        var rds = this.cityMap.getRoads();
        var rd = rds[Math.floor(Math.random() * rds.length)];
        var rdBBox = rd.getBoundingBox();
        
        var cx, cy;
        if(rd.isVertical){
            cx = rdBBox[0] + rdBBox[2] / 2;
            cy = rdBBox[1] + CIVILIAN_SQUARE_HALFWIDTH + Math.random() * (rdBBox[3] - 2*CIVILIAN_SQUARE_HALFWIDTH);
        } else {
            cx = rdBBox[0] + CIVILIAN_SQUARE_HALFWIDTH + Math.random() * (rdBBox[2] - 2*CIVILIAN_SQUARE_HALFWIDTH);
            cy = rdBBox[1] + rdBBox[3] / 2;
        }
        var civ = new Civilian({id: id, x: cx, y: cy});
        
        civ.setCurrentRoad(rd);
        civ.setCurrentRoad(rd);
        
        civ.setDestinationPoint([cx, cy]);
        
        civ.setMoveAngle(rd.isVertical ? [Math.PI / 2, 3 * Math.PI / 2][Math.floor(Math.random()*2)] :
                                         [0, Math.PI][Math.floor(Math.random()*2)]);
        
        this.civilians.push(civ);
        this.movable.push(civ);
        this.renderable.push(civ);
    }
    
    this.__updateFocusComboBox();
}



/*
    For Game setup, populate the map with some amount of humans.
*/
GameEngine.prototype.__populateMapWithSoldiers = function(){
    while(this.soldiers.length < MAX_SOLDIER_COUNT){
        // Spawn a Soldier somewhere random on the map.
        var id = "soldiers" + ("000" + this.__unit_counter).slice(-3);
        this.__unit_counter++;
    
        var rds = this.cityMap.getRoads();
        var rd = rds[Math.floor(Math.random() * rds.length)];
        var rdBBox = rd.getBoundingBox();
        
        var cx, cy;
        if(rd.isVertical){
            cx = rdBBox[0] + rdBBox[2] / 2;
            cy = rdBBox[1] + SOLDIER_SQUARE_HALFWIDTH + Math.random() * (rdBBox[3] - 2*SOLDIER_SQUARE_HALFWIDTH);
        } else {
            cx = rdBBox[0] + SOLDIER_SQUARE_HALFWIDTH + Math.random() * (rdBBox[2] - 2*SOLDIER_SQUARE_HALFWIDTH);
            cy = rdBBox[1] + rdBBox[3] / 2;
        }
        var civ = new Soldier({id: id, x: cx, y: cy});
        
        civ.setCurrentRoad(rd);
        civ.setCurrentRoad(rd);
        
        civ.setDestinationPoint([cx, cy]);
        
        civ.setMoveAngle(rd.isVertical ? [Math.PI / 2, 3 * Math.PI / 2][Math.floor(Math.random()*2)] :
                                         [0, Math.PI][Math.floor(Math.random()*2)]);
        
        this.soldiers.push(civ);
        this.movable.push(civ);
        this.renderable.push(civ);
    }
    
    this.__updateFocusComboBox();
}




// Start/Resume game animation.
GameEngine.prototype.start = function(){
    if(this.gamePaused){
        this.gamePaused = false;
        this.gameState = GameEngineStates.RUNNING;
        var date = new Date();
        var time = date.getTime();
        this.tick(time);
    }
};



GameEngine.prototype.tick = function tick(lastTime){
    var date = new Date();
    var time = date.getTime();
    var delta = time - lastTime;
    
    // we're only using .gameSpeed as a "debug" feature
    // at this stage.
    if(this.__debugEnabled){ delta *= this.gameSpeed; }
    
    // for framerate
    this.__fps = 1000 / delta;

    this.__tickInfluencers(delta);
    this.__tickParticleEmitters(delta);
    this.move(delta);
    
    this.__checkGameTerminationConditions();
    this.render(this.context);
    
    if(this.__debugEnabled && this.debugContext){
        this.renderDebugCanvas(this.debugContext);
    }
    
    // Assert that |zombies| < MaxZombies + MaxCivs.
    if(this.zombies.length > MAX_CIVILIAN_COUNT + GAME_DEFAULT_NUMBER_ZOMBIES + MAX_SOLDIER_COUNT){
        throw "Error! Too many zombies spawned somehow.";
    }

    //Call function again
    if(!this.gamePaused){
        window.setTimeout(this.myTick, 10, time);
    }
};



/*
  Checks whether the game has yet been won or lost.
*/
GameEngine.prototype.__checkGameTerminationConditions = function(){
    // The game is lost if there are no more zombies, AND
    //  there are no more zombies available.
    if(this.zombies.length === 0 && this.numZombiesAvailableToSpawn === 0){
        this.gameState = GameEngineStates.LOST;
    }
    
    // The game is won if there are no more civilians or soldiers
    //  left alive on the map. They must all be zombies.
    if(this.civilians.length + this.soldiers.length === 0){
        this.gameState = GameEngineStates.WON;
    }
}



GameEngine.prototype.__tickInfluencers = function(delta){
    // Update Influencers
    this.placedInfluencers.forEach(function(inflr){
        inflr.tick(delta);
    });
    var expiredInfluencers = this.placedInfluencers.filter(function(inflr){
        return inflr.isExpired();
    });
    expiredInfluencers.forEach(function(inflr){
        removeFromList(inflr, this.placedInfluencers);
    }.bind(this));
}



GameEngine.prototype.__tickParticleEmitters = function(delta){
    // TODO: Abstract this common clause.
    this.smokeEmitters.forEach(function(emitter){
        emitter.tick(delta);
    });
    var expiredEmitters = this.smokeEmitters.filter(function(emitter){
        return emitter.isExpired();
    });
    expiredEmitters.forEach(function(emitter){
        removeFromList(emitter, this.smokeEmitters);
    }.bind(this));
}



GameEngine.prototype.__checkSoldierTarget = function(soldier) {
    /*
      Here we will check that soldier is targetting the zombie
      closest to itself. (Another way might be to only switch 
      targets if the Soldier has no target);
    */

    if(soldier.target){
        if(!this.cityMap.clearLineOfSight([soldier.x, soldier.y],
                                          [soldier.target.x, soldier.target.y])){
            soldier.target = null;
        } else if(soldier.target.isExpired()){
            soldier.target = null;
        }
    }

    var selectClosestTarget = true;
    if(selectClosestTarget || !soldier.target){
        var targetsInRange = this.zombies.filter(function(z){
            // Can target zombie if zombie in line of sight.
            return this.cityMap.clearLineOfSight([soldier.x, soldier.y],
                                                 [z.x, z.y])
                && soldier.getDistanceToUnit(z) < soldier.getRange();
        }.bind(this));

        if(targetsInRange.length > 0){
            var newTarget = targetsInRange.reduce(function(z1, z2){
                var d1 = soldier.getDistanceToUnit(z1);
                var d2 = soldier.getDistanceToUnit(z1);
                return d1 < d2 ? z1 : z2;
            });

            soldier.target = newTarget;
        }
    }

    // Maybe shoot at the targets if we can
    if(soldier.canShoot()){
        var bullet = soldier.createBullet();

        this.bullets.push(bullet);
        this.renderable.push(bullet);
    }
};



GameEngine.prototype.__moveBullets = function(delta){
    for(var i = 0; i < this.bullets.length; i++){
        var bullet = this.bullets[i];
        bullet.move(delta);

        // NOTE: Here we assume Bullets only damage Zombies.
        for(var j = 0; j < this.zombies.length; j++){
            if(!this.zombies[j]){ continue; }

            var z = this.zombies[j];
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
        removeFromList(bullet, this.renderable);
    }.bind(this));
};



/*
 Move game entities, and check collisions.
 O(n^2)
*/
GameEngine.prototype.move = function(delta){
    this.handlePlayerInput();
    this.__moveBullets(delta);



    // Move ZOMBIES
    this.zombies.forEach(function(zombie){
        var inflrs = this.placedInfluencers.filter(function(inflr){
                                                       return inflr.hasInfluenceOnUnit(zombie);
                                                   });
        do_zombie_move_smarter(delta, zombie, this.cityMap, inflrs);
    }.bind(this));
    var expiredZombies = this.zombies.filter(function(zombie){
        return zombie.isExpired();
    });
    expiredZombies.forEach(function(zombie){
        this.removeObject(zombie);
        removeFromList(zombie, this.zombies);
    }.bind(this));

    // Maybe Spawn ZOMBIES
    this.zombie_timer += delta;
    if(this.zombie_timer > 1000){
        this.zombie_timer -= 1000;

        // We check that there are zombies available, so we can limit the number of
        // zombies spawned. -1 means Infinite number of zombies will spawn.
        var hasZombiesToSpawn = this.numZombiesAvailableToSpawn > 0 ||
                                (this.numZombiesAvailableToSpawn === -1 && this.zombies.length < MAX_ZOMBIE_COUNT);
        
        if(hasZombiesToSpawn){
            this.spawnZombie();
            this.numZombiesAvailableToSpawn--;
        }
    }
    


    // Move CIVILIANS
    this.civilians.forEach(function(civ){
        var inflrs = this.placedInfluencers.filter(function(inflr){
                                                       return inflr.hasInfluenceOnUnit(civ);
                                                   });
        do_civilian_move(delta, civ, this.cityMap, inflrs);
    }.bind(this));



    // Move SOLDIERS
    this.soldiers.forEach(function(soldier){
        var inflrs = this.placedInfluencers.filter(function(inflr){
                                                       return inflr.hasInfluenceOnUnit(soldier);
                                                   });
        this.__checkSoldierTarget(soldier);
        do_soldier_move(delta, soldier, this.cityMap, inflrs);
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
    this.movable.forEach(function(m){
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
}



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
    // Resolve the collision between objects obj1 and obj2.
    if(obj1 instanceof Zombie && obj2 instanceof Civilian){
        // Convert civilian to zombie
        this.__convertHumanToZombie(obj2);
    }
    if(obj1 instanceof Zombie && obj2 instanceof Soldier){
        // Convert soldier to zombie
        this.__convertHumanToZombie(obj2);
    }
};



/*
  Converts a Human (civilian, soldier, etc.) into a zombie.
*/
GameEngine.prototype.__convertHumanToZombie = function(hum){
    this.removeObject(hum);
    switch(hum.getObjectType()){ // Check which list we need to remove human from.
    case ObjectTypes.CIVILIAN:
        removeFromList(hum, this.civilians);
        break;
    case ObjectTypes.SOLDIER:
        removeFromList(hum, this.soldiers);
        break;
    }
    
    var id = "zombie" + ("000" + this.__unit_counter).slice(-3);
    this.__unit_counter++;
    
    var pt = [hum.getX(), hum.getY()];
    var rd = this.cityMap.getRoadAt(pt);
    var zombie = new Zombie({id: id, x: pt[0], y: pt[1]});

    // for the Zombie movement AI.
    zombie.setCurrentRoad(rd);
    zombie.setCurrentRoad(rd);

    zombie.setDestinationPoint(pt);
    
    zombie.setMoveAngle(rd.isVertical ? [Math.PI / 2, 3 * Math.PI / 2][Math.floor(Math.random()*2)] :
                                     [0, Math.PI][Math.floor(Math.random()*2)]);

    this.zombies.push(zombie);
    this.movable.push(zombie);
    this.renderable.push(zombie);
    
    this.__updateFocusComboBox();
};



// Creates an explosion as well as removing it
GameEngine.prototype.destroyObject = function(movingObj){
    // Simulate game effects from destroying the object,
    // before we remove it from the game. (e.g. drop an item).

    this.removeObject(movingObj);
}



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



GameEngine.prototype.removeObject = function(movingObj){
    if(!movingObj.equals){
        throw "Expects object to have equals functionality.";
    }

    removeFromList(movingObj, this.movable);
    removeFromList(movingObj, this.renderable);
    
    // This fixes a bug wherein we when checking collisions,
    // an object might have been removed more than once.
    movingObj.removed = true;
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



GameEngine.prototype.handlePlayerInput = function(){
    // Do stuff in the game using the functions
    // like isKeyPressed
    
    this.gameSpeed = gameSpeedSlider.value;
    gameSpeedLabel.innerHTML = this.gameSpeed;
    
    if(this.currentInfluencer){
        this.currentInfluencer.x = this.mouseX;
        this.currentInfluencer.y = this.mouseY;
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
}



GameEngine.prototype.updateUI = function(){
    // Update numbers of Zombies, Civilians, and Total
    var nzombies = this.zombies.filter(function(x){return x;}).length;
    var ncivs = this.civilians.filter(function(x){return x;}).length;
    count_zombies_lbl.innerHTML = nzombies;
    count_civilians_lbl.innerHTML = ncivs;
    count_total_lbl.innerHTML = nzombies + ncivs;
}



GameEngine.prototype.__renderInfluencersUnder = function(ctx){
    var unitArrays = [this.zombies, this.civilians];
    function drawUnderUnits(ctx, inflr){
        unitArrays.forEach(function(arr){
            arr.forEach(function(unit){
                inflr.drawEffectUnderUnitPreview(ctx, unit)
            });
        });
    }
    
    this.placedInfluencers.forEach(function(inflr){
        drawUnderUnits(ctx, inflr);
    }.bind(this));
    
    // Draw Influencer *under* units
    var mouseOnScreen = 0 < this.mouseX && this.mouseX < GAME_WIDTH &&
                        0 < this.mouseY && this.mouseY < GAME_HEIGHT;
    if(this.currentInfluencer && mouseOnScreen){
        drawUnderUnits(ctx, this.currentInfluencer);
    }
}



GameEngine.prototype.__renderInfluencersOver = function(ctx){
    var unitArrays = [this.zombies, this.civilians];
    function drawOverUnits(ctx, inflr){
        unitArrays.forEach(function(arr){
            arr.forEach(function(unit){
                inflr.drawEffectOnUnitPreview(ctx, unit)
            });
        });
    }
    
    this.placedInfluencers.forEach(function(inflr){
        drawOverUnits(ctx, inflr);
    }.bind(this));
    
    // Draw Influencer *under* units
    var mouseOnScreen = 0 < this.mouseX && this.mouseX < GAME_WIDTH &&
                        0 < this.mouseY && this.mouseY < GAME_HEIGHT;
    if(this.currentInfluencer && mouseOnScreen){
        drawOverUnits(ctx, this.currentInfluencer);
    }
}



GameEngine.prototype.__renderInfluencers = function(ctx){
    this.placedInfluencers.forEach(function(inflr){
        inflr.drawEffectiveArea(ctx);
    });
    
    var mouseOnScreen = 0 < this.mouseX && this.mouseX < GAME_WIDTH &&
                        0 < this.mouseY && this.mouseY < GAME_HEIGHT;
    if(this.currentInfluencer && mouseOnScreen){
        this.currentInfluencer.drawEffectiveAreaPreview(ctx);
    }
}



/*
 Render objects to canvas' context.
*/
GameEngine.prototype.render = function(ctx){
    this.updateUI();
    
    // Fill Background, and CityMap/Roads
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.cityMap.render(ctx);

    // Draw Influencer *under* units
    this.__renderInfluencersUnder(ctx);
    
    // Draw Influencers
    this.__renderInfluencers(ctx);
    
    // Draw (Renderable) Units
    for(var i = 0; i < this.renderable.length; i++){
        if(this.renderable[i]){
            this.renderable[i].render(ctx);
        }
    }

    // Draw Influencer *over* units
    this.__renderInfluencersOver(ctx);
    
    // Render Smoke Emitters
    this.smokeEmitters.forEach(function(emitter){
        emitter.render(ctx);
    });
    
    
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
}



GameEngine.prototype.setCurrentInfluencer = function(inflr){
    console.log("Influencer Set! " + inflr);
    this.currentInfluencer = inflr;
};



GameEngine.prototype.getUnitsInInfluenceZone = function(inflr){
    // Not necessarily a good idea to use this when influencing
    //  movement.
    return this.movable.filter(function(mvr){
        return inflr.isUnitInInfluenceArea(mvr);
    });
}



// Record key press
GameEngine.prototype.keydown = function(evt){
    var keyCode = (window.event) ? event.keyCode : evt.keyCode;
    this.keysPressed[keyCode] = true;
};



// Record key release
GameEngine.prototype.keyup = function(evt){
    var keyCode = (window.event) ? event.keyCode : evt.keyCode;
    this.keysPressed[keyCode] = false;
};



// Check whether the given keyCode is pressed
GameEngine.prototype.isKeyPressed = function(keyCode){
    return this.keysPressed[keyCode] === true;
};



GameEngine.prototype.canvasMouseDown = function(ev){
    if(this.currentInfluencer){
        // Make smoke emitter
        var x = this.currentInfluencer.x;
        var y = this.currentInfluencer.y;
        var duration = this.currentInfluencer.duration;
        var smokeEmitter = new SmokeEmitter({x: x,
                                             y: y,
                                             emitFrequency: 30,
                                             duration: duration * 1.5});
        this.smokeEmitters.push(smokeEmitter);
        
        this.placedInfluencers.push(this.currentInfluencer);
        this.currentInfluencer.t = 0; // reset counter, if it was used.
        this.currentInfluencer = null;
    }
}



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
}
