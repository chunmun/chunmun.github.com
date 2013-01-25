/*
  CityMap.js - file for the CityMap object, and functions related to CityMap.
*/

// Road Direction Constants
var ROAD_DIRECTION_EAST = 0;
var ROAD_DIRECTION_NORTH = 1;
var ROAD_DIRECTION_WEST = 2;
var ROAD_DIRECTION_SOUTH = 3;
// Array of road directions
// Not guaranteed to be in order
var ROAD_DIRECTIONS = [ROAD_DIRECTION_EAST,
                       ROAD_DIRECTION_NORTH,
                       ROAD_DIRECTION_WEST,
                       ROAD_DIRECTION_SOUTH];

var ROAD_RADIUS = 8; // Half Road is 10px wide/thick.
var ROAD_WIDTH = ROAD_RADIUS * 2;



/*
  Map Generation array - so that we can easily experiment with
   different generation algorithms.
*/
var MAP_SELECTED_GENERATOR = 1;
var MAP_GENERATORS = [function(){ return makeGridCityMap(4, 3); },
                      makeRandomCityMap];



var errorMap1 = [[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],[1,0,0,0,2,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,0],[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],[2,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],[1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0],[1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0],[2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,2,1,1],[1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0],[1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,1,0,0],[2,1,1,1,1,1,1,2,1,1,2,1,1,2,1,0,0,1,0,0,1,0,0],[1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],[1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],[1,0,1,0,0,0,0,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1,1],[0,0,1,0,0,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0],[1,1,2,1,1,1,1,2,1,1,1,1,2,1,1,2,1,0,0,0,1,0,0],[0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,2,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];

function dir_clockwise(dir){
    switch(dir){
        case ROAD_DIRECTION_NORTH:
            return ROAD_DIRECTION_EAST;
        case ROAD_DIRECTION_EAST:
            return ROAD_DIRECTION_SOUTH;
        case ROAD_DIRECTION_SOUTH:
            return ROAD_DIRECTION_WEST;
        case ROAD_DIRECTION_WEST:
            return ROAD_DIRECTION_NORTH;
    }
    
    throw "Didn't recognise direction " + dir;
}



function dir_counterclockwise(dir){
    switch(dir){
        case ROAD_DIRECTION_NORTH:
            return ROAD_DIRECTION_WEST;
        case ROAD_DIRECTION_EAST:
            return ROAD_DIRECTION_NORTH;
        case ROAD_DIRECTION_SOUTH:
            return ROAD_DIRECTION_EAST;
        case ROAD_DIRECTION_WEST:
            return ROAD_DIRECTION_SOUTH;
    }
    
    throw "Didn't recognise direction " + dir;
}



function getUnitVectorForDirection(dir){
    switch(dir){
        case ROAD_DIRECTION_NORTH:
            return [0, -1];
        case ROAD_DIRECTION_SOUTH:
            return [0, 1];
        case ROAD_DIRECTION_EAST:
            return [1, 0];
        case ROAD_DIRECTION_WEST:
            return [-1, 0];
        default:
            throw "Invalid direction given: " + dir;
    }
}



function Road(args){
    /*
      Road, used for the CityMap. Units confined to Road.
      "Road" represents the most confined element of a road on map,
      e.g. a road with an intersection in the middle is not one Road
      object.

      args expects: startPoint - starting point of road,
                    endPoint - ending point of road.
      (Points defined as per Geometry.js)
    */

    if(!args){
        return;
    }

    // Check args has nice arguments
    this.p = args.startPoint;
    this.q = args.endPoint;
    if(!Geometry.isLineSegmentOrthoganal([this.p, this.q])){
        throw "Error! Road not given orthoganal start/end points";
    }
    if(this.p[0] > this.q[0] ||
       this.p[1] > this.q[1]){
        // Ensure startPoint is further left & up than endPoint.
        // Swap if not.
        this.q = args.startPoint;
        this.p = args.endPoint;
    }

    /*
      startPoint and endPoint refer to the very edges of the left/right
      or top/bottom sides of the "road"; this line is then padded by
      ROAD_RADIUS to give the rectangle for the road.
    */
    this.isVertical = args.startPoint[0] === args.endPoint[0];
    var x, y, width, height;
    if(this.isVertical){
        x = this.p[0] - ROAD_RADIUS;
        y = this.p[1];
        width = ROAD_WIDTH;
        height = this.q[1] - this.p[1];
    } else {
        x = this.p[0];
        y = this.p[1] - ROAD_RADIUS;
        width = this.q[0] - this.p[0];
        height = ROAD_WIDTH;
    }
    
    var polyArgs = {};
    // This could maybe be cleaned up, so as to be clearer.
    // n.b. getExitInDirection relies on some precise order.
    polyArgs.x = x;
    polyArgs.y = y;
    polyArgs.polyCoords = [[0, 0],
                           [0, height],
                           [width, height],
                           [width, 0]];
    //polyArgs.polyCoords = this.isVertical ? [[this.p[0] - ROAD_RADIUS, this.p[1]],
    //                                         [this.q[0] - ROAD_RADIUS, this.q[1]],
    //                                         [this.q[0] + ROAD_RADIUS, this.q[1]],
    //                                         [this.p[0] + ROAD_RADIUS, this.p[1]]]
    //                                      : [[this.p[0], this.p[1] - ROAD_RADIUS],
    //                                         [this.p[0], this.p[1] + ROAD_RADIUS],
    //                                         [this.q[0], this.q[1] + ROAD_RADIUS],
    //                                         [this.q[0], this.q[1] - ROAD_RADIUS]];
    RenderablePolygon.call(this, polyArgs);
    this.fillColor = "#888888";
    this.adjRoads = [];
}
Road.prototype = new RenderablePolygon({});



Road.prototype.getStartPoint = function(){
    return this.p;
};



Road.prototype.getEndPoint = function(){
    return this.q;
};



Road.prototype.getCenterPoint = function(){
    return Geometry.midpoint([this.p, this.q]);
}



Road.prototype.isValidDirection = function(direction){
    // Check that the direction given is valid
    // for this road. i.e. vertical:NORTH, SOUTH; otherwise: EAST, WEST
    return this.isVertical ? (direction === ROAD_DIRECTION_NORTH || direction == ROAD_DIRECTION_SOUTH)
                           : (direction === ROAD_DIRECTION_EAST || direction === ROAD_DIRECTION_WEST);
};



Road.prototype.addAdjacentRoad = function(direction, road){
    if(this.isValidDirection(direction)){
        this.adjRoads[direction] = road;
    } else {
        throw "Error! Not a valid direction for this road!: " + (this.isVertical ? "Vert" : "Horz") + ", dir=" + direction;
    }
};



Road.prototype.getAdjacentRoads = function(){
    return this.adjRoads;
};



/*
  Returns the "exit" in the given direction.
  An "exit" is a line segment, which imitates
  a "door" between roads.
*/
Road.prototype.getExitInDirection = function(direction){
    var points = this.calculatePolygonCoordinates();
    switch(direction){
        case ROAD_DIRECTION_WEST:
            return [points[0], points[1]];
        case ROAD_DIRECTION_SOUTH:
            return [points[1], points[2]];
        case ROAD_DIRECTION_EAST:
            return [points[2], points[3]];
        case ROAD_DIRECTION_NORTH:
            return [points[3], points[0]];
    }

    throw "Direction Not Found! " + direction;
}



/*
  Checks whether the given object collides with any of the
  edges of this road.
  Returns the direction of the intersection, or -1 if
  no intersection is present.
  
  ONLY consider intersections where there's not
  another road.

  NOTE: 
*/
Road.prototype.getIntersectsDirection = function(obj){
    for(var i = 0; i < ROAD_DIRECTIONS.length; i++){
        var direction = ROAD_DIRECTIONS[i];
        if(this.adjRoads[direction]){
            // ONLY consider intersections where there's not
            // another road.
            continue;
        }

        var exit = this.getExitInDirection(direction);

        if(Geometry.linePolygonIntersect(exit, obj.calculatePolygonCoordinates())){
            return direction;
        }
    }

    return -1;
};



/*
  Finds the direction to a given Road.
  (Assuming the road is a neighbour of this
  road).
*/
Road.prototype.findDirectionToNeighbour = function(rd){
    for(var dir = 0; dir < this.adjRoads.length; dir++){
        if(this.adjRoads[dir] && this.adjRoads[dir].equals(rd)){
            return dir;
        }
    }
    return -1;
}

/*
  Finds the road adjacent to this road 
  in a given direction. Return null if not found
*/
Road.prototype.getRoadInDirection = function(dir){
  var rd = this.adjRoads[dir];
  if(rd instanceof Road){
    return rd;
  }else{
    return null;
  }
}

Road.prototype.equals = function(other){
    if(!other || !other.getBoundingBox){ return false; }

    // Check two "roads" are equal, by checking their bounding boxes.
    var bbox = this.getBoundingBox();
    var o_bbox = other.getBoundingBox();

    return bbox[0] === o_bbox[0] &&
           bbox[1] === o_bbox[1] &&
           bbox[2] === o_bbox[2] &&
           bbox[3] === o_bbox[3];
};



function joinRoads(road1, road2){
    /*
      Join two roads together.
      Figure out the directions where they can be joined, or
      throw an error if they cannot be joined.

      Four cases:
      1) road1 West, road2 East;
      2) road1 East, road2 West;
      3) road1 North, road2 South;
      4) road1 South, road2 North;
    */
    function floatEqual(f1, f2){
        return Math.abs(f1 - f2) < 0.0001;
    }

    var bbox1 = road1.getBoundingBox(); // rect [x, y, w, h]
    var bbox2 = road2.getBoundingBox();
    if(floatEqual(bbox1[0] + bbox1[2], bbox2[0])){ // Case 1.
        road1.addAdjacentRoad(ROAD_DIRECTION_EAST, road2);
        road2.addAdjacentRoad(ROAD_DIRECTION_WEST, road1);
    } else if(floatEqual(bbox1[0], bbox2[0] + bbox2[2])){
        road1.addAdjacentRoad(ROAD_DIRECTION_WEST, road2);
        road2.addAdjacentRoad(ROAD_DIRECTION_EAST, road1);
    } else if(floatEqual(bbox1[1] + bbox1[3], bbox2[1])){
        road1.addAdjacentRoad(ROAD_DIRECTION_SOUTH, road2);
        road2.addAdjacentRoad(ROAD_DIRECTION_NORTH, road1);
    } else if(floatEqual(bbox1[1], bbox2[1] + bbox2[3])){
        road1.addAdjacentRoad(ROAD_DIRECTION_NORTH, road2);
        road2.addAdjacentRoad(ROAD_DIRECTION_SOUTH, road1);
    } else {
        console.log("Could not join!");
        console.log("road1 Bounding Box: " + bbox1);
        console.log("road2 Bounding Box: " + bbox2);
        throw "Error! Cannot join roads! Not adjacent";
    }
}



/*
  A function to join all the roads in an array of roads together,
   assuming road positions are actually adjacent, so that our 
   road generating algorithms don't have to bother about so
   tediously calling joinRoads.

  Assumes Roads are joined only to Intersections, and Intersections
   are connected only to Roads.
*/
function joinAllRoads(rds){
    // Partition into Intersections, Horizontal and Vertical Roads.
    var isects = rds.filter(function(rd){
        return rd instanceof Intersection;
    });
    var hRds = rds.filter(function(rd){
        return rd instanceof Road && !(rd instanceof Intersection) && !rd.isVertical;
    });
    var vRds = rds.filter(function(rd){
        return rd instanceof Road && !(rd instanceof Intersection) && rd.isVertical;
    });

    isects.forEach(function(isect){
        // Road to the West and East, if they exist,
        //  must come from hRds.

        var left = isect.getCenterPoint()[0] - ROAD_RADIUS;
        var right = isect.getCenterPoint()[0] + ROAD_RADIUS;
        var top = isect.getCenterPoint()[1] - ROAD_RADIUS;
        var bottom = isect.getCenterPoint()[1] + ROAD_RADIUS;

        hRds.forEach(function(rd){
            // Check Horiz.
            if(rd.getEndPoint()[1] === isect.getCenterPoint()[1]){
                if(rd.getEndPoint()[0] === left){
                    joinRoads(isect, rd);
                } else if(rd.getStartPoint()[0] === right) {
                    joinRoads(isect, rd);
                }
            }
        });
        
        vRds.forEach(function(rd){
            // Check Vert.
            if(rd.getEndPoint()[0] === isect.getCenterPoint()[0]){
                if(rd.getEndPoint()[1] === top){
                    joinRoads(isect, rd);
                } else if(rd.getStartPoint()[1] === bottom){
                    joinRoads(isect, rd);
                }
            }
        });
    });
}



/*
  Duplicates an array of Roads, making new Road and Intersection
   objects from these.
*/
function copyRoads(rds){
    return rds.map(function (rd){
        if(rd instanceof Intersection){
            return new Intersection({point: rd.getCenterPoint()});
        } else if(rd instanceof Road) {
            return new Road({startPoint: rd.getStartPoint(),
                             endPoint: rd.getEndPoint()});
        }
    });
}






function Intersection(args){
    /*
      Intersection is-a Road, used for the CityMap.

      An Intersection is a (horizontal) Road, which can have a Road
      adjacent in any direction.

      args expects: point - point where the intersection is.
      (Points defined as per Geometry.js)
    */

    // Check args has nice arguments
    var p = args.point;

    // Inherit functionality from Road.
    var rdArgs = {};
    rdArgs.startPoint = [p[0] - ROAD_RADIUS, p[1]];
    rdArgs.endPoint = [p[0] + ROAD_RADIUS, p[1]];
    Road.call(this, rdArgs);
}
Intersection.prototype = new Road();

Intersection.prototype.isValidDirection = function(direction){
    /*
      We use this function to override the Road functionality,
      so as to allow Roads from any direction to be adjacent.
    */
    return true;
};





function Building(args){
    /*
      Buildings, at this stage, do nothing other than look pretty,
      as the moving units will be confined to the roads.

      The idea is to generate these from the Road/CityMap.
    */

    // We shift the polyCoords in the args given to us 
    //  so that the first polygon point is at [0, 0].
    var polyArgs = {};
    var x = (args.x || 0) + args.polyCoords[0][0];
    var y = (args.y || 0) + args.polyCoords[0][1];
    polyArgs.x = x;
    polyArgs.y = y;
    polyArgs.polyCoords = args.polyCoords.map(function(p){
        return [p[0] - x,
                p[1] - y];
    });
    RenderablePolygon.call(this, polyArgs);
    this.fillColor = "#444444";
}
Building.prototype = new RenderablePolygon();



Building.prototype.equals = function(other) {
    // Explicitly just use RenderablePolygon's method to 
    //  check two Buildings are equal.
    return RenderablePolygon.prototype.equals.call(this, other);
};






function CityMap(args){
    this.spawnpoint = [-1, -1];
    this.roads = []; // Keep roads in an array.
    this.buildings = [];
}



CityMap.prototype.addRoad = function(road){
    this.roads.push(road);
    this.updateSpawnPoint(road);
}




CityMap.prototype.addRoads = function(roads){
    for(var i = 0; i < roads.length; i++){
        this.addRoad(roads[i]);
    }
}



CityMap.prototype.addBuilding = function(building){
    this.buildings.push(building);
}



CityMap.prototype.addBuildings = function(buildings){
    buildings.forEach(function(building){
        this.addBuilding(building);
    }.bind(this));
}



CityMap.prototype.generateBuildings = function(){
    this.addBuildings(generateBuildingsFromRoads(augmentRoadsWithFramingRoads(this.roads)));
}



/*
  Assume: At least one road is added
  Updates the spawnpoint so that it is always maintained at the top left
  corner of the roads as we add them
*/
CityMap.prototype.updateSpawnPoint = function(road){
    var p = road.getStartPoint();
    if(this.spawnpoint[0] !== -1){
        if(this.spawnpoint[0] >= p[0] && this.spawnpoint[1]>=p[1]){
            this.spawnpoint[0] = p[0];
            this.spawnpoint[1] = p[1];
        }
    } else {
        this.spawnpoint[0] = p[0];
        this.spawnpoint[1] = p[1];
    }
};



CityMap.prototype.getRoads = function(){
    return this.roads;
};



/*
  Get the road which contains the point,
  or return none if none exist
*/
CityMap.prototype.getRoadAt = function(pt){
    // Naive. Check through all roads to see if any contain
    // the given point.

    for(var i = 0; i < this.roads.length; i++){
        var road = this.roads[i];

        var bbox = road.getBoundingBox();
        if(bbox[0] <= pt[0] && pt[0] <= bbox[0] + bbox[2] &&
           bbox[1] <= pt[1] && pt[1] <= bbox[1] + bbox[3]){
            return road;
        }
        //// Below is bugged somehow. >:-|
        //var poly = road.calculatePolygonCoordinates();
        //
        //if(Geometry.pointInPolygon(pt, poly)){
        //    return road;
        //}
    }

    // No road found. return null.
    return null;
}



CityMap.prototype.render = function(context){
    // Render roads
    for(var i = 0; i < this.roads.length; i++){
        this.roads[i].render(context);
    }

    // Render buildings
    for( var i = 0; i < this.buildings.length; i++){
        this.buildings[i].render(context);
    }
};



/*
  Checks if there is a clear line of sight between
  pt1 and pt2.

  This is done by checking no buildings Intersect 
   the line segment between pt1 and pt2.
*/
CityMap.prototype.clearLineOfSight = function(pt1, pt2){
    var l = [pt1, pt2];

    // Check all buildings for a collision.
    for(var i =0; i < this.buildings.length; i++){
        var b = this.buildings[i];
        var bPoly = b.calculatePolygonCoordinates();
        
        if(Geometry.linePolygonIntersect(l, bPoly)){
            return false;
        }
    }

    return true;
}



function makeSimpleCityMap(){
    /*
      A function to make a very simple city map,
      so that we can build other functionality while
      CityMap is being developed.
    */
    cmArgs = {};
    var cityMap = new CityMap(cmArgs);

    var r = ROAD_RADIUS;

    var road_tlt = new Road({startPoint: [5*r, 0], endPoint: [5*r, 4*r]});
    var road_tll = new Road({startPoint: [0, 5*r], endPoint: [4*r, 5*r]});
    var isect_tl = new Intersection({point: [5*r, 5*r]});

    var road_t = new Road({startPoint: [6*r, 5*r], endPoint: [GAME_WIDTH - 6*r, 5*r]});

    var road_trt = new Road({startPoint: [GAME_WIDTH - 5*r, 0], endPoint: [GAME_WIDTH - 5*r, 4*r]});
    var road_trr = new Road({startPoint: [GAME_WIDTH - 0, 5*r], endPoint: [GAME_WIDTH - 4*r, 5*r]});
    var isect_tr = new Intersection({point: [GAME_WIDTH - 5*r, 5*r]});

    var road_r = new Road({startPoint: [GAME_WIDTH - 5*r, 6*r], endPoint: [GAME_WIDTH - 5*r, GAME_HEIGHT - 6*r]});

    var road_brb = new Road({startPoint: [GAME_WIDTH - 5*r, GAME_HEIGHT - 0], endPoint: [GAME_WIDTH - 5*r, GAME_HEIGHT - 4*r]});
    var road_brr = new Road({startPoint: [GAME_WIDTH - 0, GAME_HEIGHT - 5*r], endPoint: [GAME_WIDTH - 4*r, GAME_HEIGHT - 5*r]});
    var isect_br = new Intersection({point: [GAME_WIDTH - 5*r, GAME_HEIGHT - 5*r]});

    var road_b = new Road({startPoint: [6*r, GAME_HEIGHT - 5*r], endPoint: [GAME_WIDTH - 6*r, GAME_HEIGHT - 5*r]});

    var road_blb = new Road({startPoint: [5*r, GAME_HEIGHT - 0], endPoint: [5*r, GAME_HEIGHT - 4*r]});
    var road_bll = new Road({startPoint: [0, GAME_HEIGHT - 5*r], endPoint: [4*r, GAME_HEIGHT - 5*r]});
    var isect_bl = new Intersection({point: [5*r, GAME_HEIGHT - 5*r]});

    var road_l = new Road({startPoint: [5*r, 6*r], endPoint: [5*r, GAME_HEIGHT - 6*r]});

    var roads = [road_tlt, road_tll, isect_tl, road_t,
                 road_trt, road_trr, isect_tr, road_r,
                 road_brb, road_brr, isect_br, road_b,
                 road_blb, road_bll, isect_bl, road_l];

    // Join Roads
    // TODO: Have some function to do this.
    // (Whether CityMap can do this itself, or whether it needs a complete
    //  bunch of connected-roads...).
    joinRoads(road_tlt, isect_tl);
    joinRoads(road_tll, isect_tl);
    joinRoads(road_t, isect_tl);
    joinRoads(road_l, isect_tl);

    joinRoads(road_trt, isect_tr);
    joinRoads(road_trr, isect_tr);
    joinRoads(road_t, isect_tr);
    joinRoads(road_r, isect_tr);

    joinRoads(road_brb, isect_br);
    joinRoads(road_brr, isect_br);
    joinRoads(road_b, isect_br);
    joinRoads(road_r, isect_br);

    joinRoads(road_blb, isect_bl);
    joinRoads(road_bll, isect_bl);
    joinRoads(road_b, isect_bl);
    joinRoads(road_l, isect_bl);

    cityMap.addRoads(roads);
    return cityMap;
}


function makeRandomCityMap(){
  var i = 0;
    do{
        var width = Math.floor(GAME_WIDTH/ROAD_WIDTH);
        var height = Math.floor(GAME_HEIGHT/ROAD_WIDTH);
        var map_array = generateRandomMapArray(width-1,height-1);
        
        var randomCityMap = new CityMap({});
        var randomRoads = generateRoads(map_array);
        randomCityMap.addRoads(randomRoads);
        var pt = randomCityMap.spawnpoint;
        var rd = randomCityMap.getRoadAt(pt);
        if(i>100) throw "Stop execution: makeRandomCityMap is throwing up too many errors";
        i++;
    }while(rd == null || rd.getAdjacentRoads().length<=0 || noExitDirectionForSpawnPt(rd) || 
      roadNotConnected(randomRoads));
  return randomCityMap;
}

function noExitDirectionForSpawnPt(rd){
    var isectRd;
    var i=0;
    for(;i<ROAD_DIRECTIONS.length;i++){
        isectRd = rd.getAdjacentRoads()[ROAD_DIRECTIONS[i]];
        if(isectRd instanceof Road){break;}
    }

    if(isectRd==null || isectRd==-1){
      return true;
    }else{
      return false;
    }
}

function roadNotConnected(roads){
  if(roads.length==0){
    return true;
  }
  // Does a BFS to check if the roads a totally connected
  var open = Array();
  var closed = Array();
  open.push(roads[0]);
  while(open.length>0){
    var rd = open.pop();
    if(rd==null) break;
    var neighbours = rd.getAdjacentRoads();
    for(var j=0;j<neighbours.length;j++){
      if($.inArray(neighbours[j],closed)==-1 && $.inArray(neighbours[j],open)==-1){
        open.push(neighbours[j]);
      }
    }
    closed.push(rd);
  }

  if(closed.length!=roads.length){
    return true;
  }else{
    return false;
  }
}

function makeGridCityMap(cols, rows){
    /*
      A function to make a very simple city map,
      so that we can build other functionality while
      CityMap is being developed.
    */
    cmArgs = {};
    var cityMap = new CityMap(cmArgs);

    var r = ROAD_RADIUS;

    var dx = GAME_WIDTH / (cols + 1);
    var dy = GAME_HEIGHT / (rows + 1);

    // 2D arrays of our roads.
    var rds_cols = [];
    var rds_rows = [];
    var rds_isects = [];

    // Make our roads for rows and cols
    for(var row = 0; row < rows; row++){
        rds_cols[row] = [];
        rds_rows[row] = [];
        rds_isects[row] = [];

        for(var col = 0; col < cols; col++){
            // Make col
            var top_y = (row > 0) ? row * dy + r : 0;
            var bot_y = (row + 1) * dy - r;
            var rd_col = new Road({startPoint: [(col + 1) * dx, top_y],
                                   endPoint:   [(col + 1) * dx, bot_y]});

            rds_cols[row][col] = rd_col;

            // Make row
            var left_x = (col > 0) ? col * dx + r : 0;
            var right_x = (col + 1) * dx - r;
            var rd_row = new Road({startPoint: [left_x, (row + 1) * dy],
                                   endPoint: [right_x, (row + 1) * dy]});

            rds_rows[row][col] = rd_row;

            // Make i'section
            var rd_isec = new Intersection({point: [(col + 1) * dx, (row + 1) * dy]});

            rds_isects[row][col] = rd_isec;
        }

        var left_x = cols * dx + r;
        var right_x = GAME_WIDTH;
        var rd_row = new Road({startPoint: [left_x, (row + 1) * dy],
                               endPoint: [right_x, (row + 1) * dy]});

        rds_rows[row][cols] = rd_row;
    }

    // Add last column-roads to bottom
    rds_cols[rows] = [];
    for(var col = 0; col < cols; col++){
        var top_y = rows * dy + r;
        var bot_y = GAME_HEIGHT;
        var rd_col = new Road({startPoint: [(col + 1) * dx, top_y],
                               endPoint:   [(col + 1) * dx, bot_y]});

        rds_cols[rows][col] = rd_col;
    }

    // Now join all the roads together
    /*
    for(var row = 0; row < rows; row++){
        for(var col = 0; col < cols; col++){
            joinRoads(rds_rows[row][col],
                      rds_isects[row][col]);
            joinRoads(rds_rows[row][col + 1],
                      rds_isects[row][col]);
            joinRoads(rds_cols[row][col],
                      rds_isects[row][col]);
            joinRoads(rds_cols[row + 1][col],
                      rds_isects[row][col]);
        }
    }*/

    // Now add all our roads to roads array
    var roads = [];
    function addRoads(rds){
        rds.forEach(function(rd){
            roads.push(rd);
        });
    }
    rds_cols.forEach(addRoads);
    rds_rows.forEach(addRoads);
    rds_isects.forEach(addRoads);

    joinAllRoads(roads);

    cityMap.addRoads(roads);
    cityMap.generateBuildings();

    return cityMap;
}





/*
  Helper function so that generateBuildingsFromRoads
   can make buidlings for the edges/corners.

  TODO: At the moment, this does not work (the roads are not
    connected / joined, and the isections aren't added in).
*/
function augmentRoadsWithFramingRoads(roads){
    var roads = copyRoads(roads); // Copy the roads, so we don't have to worry about them.

    var r = ROAD_RADIUS;
    var tlIsect = new Intersection({point: [-r, -r]});
    var trIsect = new Intersection({point: [GAME_WIDTH + r, -r]});
    var blIsect = new Intersection({point: [-r, GAME_HEIGHT + r]});
    var brIsect = new Intersection({point: [GAME_WIDTH + r, GAME_HEIGHT + r]});

    var ghostRoads = [trIsect, tlIsect, brIsect, blIsect];

    // Top
    roads.filter(function(rd){
        return rd.getStartPoint()[1] === 0;
    }).map(function(rd){
        var isect = new Intersection({point: [rd.getStartPoint()[0],
                                              - r]});
        ghostRoads.push(isect);
        return isect;
    }).concat([tlIsect, trIsect]).sort(function(rd1, rd2){
        return rd1.getX() - rd2.getX();
    }).reduce(function(isect1, isect2){
        var y = -r;
        var x1 = isect1.getCenterPoint()[0] + r;
        var x2 = isect2.getCenterPoint()[0] - r;
        ghostRoads.push(new Road({startPoint: [x1, y],
                                  endPoint:   [x2, y]}));
        return isect2;
    });


    // Left
    roads.filter(function(rd){
        return rd.getStartPoint()[0] === 0;
    }).map(function(rd){
        var isect = new Intersection({point: [-r,
                                              rd.getStartPoint()[1]]});
        ghostRoads.push(isect);
        return isect;
    }).concat([tlIsect, blIsect]).sort(function(rd1, rd2){
        return rd1.getY() - rd2.getY();
    }).reduce(function(isect1, isect2){
        var x = -r;
        var y1 = isect1.getCenterPoint()[1] + r;
        var y2 = isect2.getCenterPoint()[1] - r;
        ghostRoads.push(new Road({startPoint: [x, y1],
                                  endPoint:   [x, y2]}));
        return isect2;
    });


    // Bottom
    roads.filter(function(rd){
        return rd.getEndPoint()[1] === GAME_HEIGHT;
    }).map(function(rd){
        var isect = new Intersection({point: [rd.getEndPoint()[0],
                                              GAME_HEIGHT + r]});
        ghostRoads.push(isect);
        return isect;
    }).concat([blIsect, brIsect]).sort(function(rd1, rd2){
        return rd1.getX() - rd2.getX();
    }).reduce(function(isect1, isect2){
        var y = GAME_HEIGHT + r;
        var x1 = isect1.getCenterPoint()[0] + r;
        var x2 = isect2.getCenterPoint()[0] - r;
        ghostRoads.push(new Road({startPoint: [x1, y],
                                  endPoint:   [x2, y]}));
        return isect2;
    });


    // Right
    roads.filter(function(rd){
        return rd.getEndPoint()[0] === GAME_WIDTH;
    }).map(function(rd){
        var isect = new Intersection({point: [GAME_WIDTH + r,
                                              rd.getEndPoint()[1]]});
        ghostRoads.push(isect);
        return isect;
    }).concat([trIsect, brIsect]).sort(function(rd1, rd2){
        return rd1.getY() - rd2.getY();
    }).reduce(function(isect1, isect2){
        var x = GAME_WIDTH + r;
        var y1 = isect1.getCenterPoint()[1] + r;
        var y2 = isect2.getCenterPoint()[1] - r;
        ghostRoads.push(new Road({startPoint: [x, y1],
                                  endPoint:   [x, y2]}));
        return isect2;
    });

    roads = roads.concat(ghostRoads);
    joinAllRoads(roads);

    return roads;
}



/*
  Takes in an array of roads which form a "city map",
   and returns an array of Buidlings such that the buildings
   fit within the spaces within the roads.
   
   Assumes roads are only in orthagonal directions,
    and that roads have been joined together.
   Assumes the leftmost roads left touch edge 0, rightmost right touch GAME_WIDTH,
    topmost top touch, bottommost bottom touch GAME_HEIGHT.
*/
function generateBuildingsFromRoads(roads){
    var buildings = [];
    
    /*
      These are the roads we consider to build
      the buildings from, i.e. intersections which have roads
      to the south and to the west.
    */
    var viableRds = roads.filter(function(rd){
        return rd instanceof Intersection &&
               rd.getAdjacentRoads()[ROAD_DIRECTION_SOUTH] &&
               rd.getAdjacentRoads()[ROAD_DIRECTION_EAST];
    });
    //TODO: We could make this algorithm more efficient and all
    // by not trying to re-make buildings for nodes we've already
    // visited. More efficient in contrived / complicated cases.
    
    for(var i = 0; i < viableRds.length; i++){
        var initRd = viableRds[i];
        var buildingPoints = [];
        var rd = viableRds[i];
        var dir = ROAD_DIRECTION_SOUTH;
        
        /*
          Our algorithm to find this building is this:
          We build up the polygons of the 'building'.
            take the Isectn point,
            and to find the next Isectn point, we
            find the next intersection in the direction.
            Now, we need to find out which direction to next
             continue in.
              -> if not left, but forward, then continue again
                 until we need to go left or right.
              -> if left or right, then add our current point,
                 and move onto next point
              (until we're back to the beginning)
        */

        var LIMIT = 99;
        do {
            // General Assumption here is that a road is connected to
            //  by two Intersections.
            // (This assumption breaks at the bottom and right of the map,
            //  so we must be careful there).
            rd = rd.getAdjacentRoads()[dir];
            
            if(!rd.getAdjacentRoads()[dir]){
                // If there's no intersection next, then we're probably at the bottom or end of the map.
                // This means we shouldn't bother making a buidling here (TODO: fix this case).
                buidlingPoints = []; // clear our points
                break;
            }

            // Search in direction for next intersection
            rd = rd.getAdjacentRoads()[dir];
            if(!(rd instanceof Intersection)){
                throw "Roads not generated/joined as assumed by this algorithm";
            }
            
            // dir_clockwise
            var leftDir = dir_counterclockwise(dir); // assumed to be same as clkwise(opp(dir)), i.e. NSEW only.
            var forwardDir = dir_clockwise(leftDir);
            var rightDir = dir_clockwise(forwardDir);
            
            var hasLeft = rd.getAdjacentRoads()[leftDir];
            var hasFoward = rd.getAdjacentRoads()[forwardDir];
            var hasRight = rd.getAdjacentRoads()[rightDir];

            if(!hasLeft && hasFoward){
                // Case: Intersection continues in same direction 
                //       our algorithm, so we treat it as a road.
                // continue in direction

                continue;
            }
            
            var exit = rd.getExitInDirection(dir_counterclockwise(dir));
            if(hasLeft){
                buildingPoints.push(exit[1]);
                dir = leftDir;
            } else if(hasRight){
                buildingPoints.push(exit[0]);
                dir = rightDir;
            } else {
                // To get here, must be !hasLeft && !hasForward && !hasRight
                throw "Ran into a dead-end Intersection";
            }
        } while(!rd.equals(initRd));
        
        if(buildingPoints.length > 0){
            var building = new Building({polyCoords: buildingPoints});
            buildings.push(building);
        }
    }
    
    
    // Filter buildings to make sure we're not talking about the same buidlings.
    //  more than once.
    // TODO: atm, we don't care about replicating buildings.
    
    return buildings;
}



function generateCityMap(args){
    // TODO: Sophisticated algorithm to generate random CityMap.
}
CityMap.generateCityMap = generateCityMap;

function generateRoads(map_array){
    var TILE_OPEN = 0;
    var TILE_ROAD = 1;
    var TILE_INTERSECTION = 2;
    var roads = [];

    for(y=0;y<map_array[0].length;y++){
        for(x=0;x<map_array.length;x++){
            if(map_array[x][y] == TILE_ROAD){
              if(x<map_array.length-1 && map_array[x+1][y] == TILE_ROAD){ //checks that the tile to the side is a road
                roads.push(extractRowOfRoad(x,y,map_array));
              }else if(y<map_array[0].length-1 && map_array[x][y+1] == TILE_ROAD){ //checks that the tile below this one is road as well
                roads.push(extractColOfRoad(x,y,map_array)); 
              }else{ //this is a road with only one tile, will convert to an intersection at this point
                map_array[x][y] = TILE_INTERSECTION;
                roads.push(extractIntersectOfRoad(x,y,map_array));
              }
            }else if(map_array[x][y] == TILE_INTERSECTION){
                roads.push(extractIntersectOfRoad(x,y,map_array));
            }
        }
    }
    return roads;
}

function extractRowOfRoad(x,y,map_array){
  //Horizontal Road
    var road;

    for(xi=x;xi<map_array.length;xi++){
      if(map_array[xi][y]!=1){
        break;
      }else{
        map_array[xi][y] = 0;
      }
    }
    road = new Road({startPoint: [x*ROAD_WIDTH,y*ROAD_WIDTH+ROAD_RADIUS],
     endPoint: [xi*ROAD_WIDTH,y*ROAD_WIDTH+ROAD_RADIUS]});
    map_array[x][y] = road;
    map_array[xi-1][y] = road;
    joinLeft(x,y,map_array,road);
    return road;
}

function extractColOfRoad(x,y,map_array){
  //Vertical Road
    var road;

    for(yi=y;yi<map_array[0].length;yi++){
      if(map_array[x][yi]!=1){
        break;
      }else{
        map_array[x][yi] = 0;
      }
    }

    road = new Road({startPoint: [x*ROAD_WIDTH+ROAD_RADIUS,y*ROAD_WIDTH], 
      endPoint: [x*ROAD_WIDTH+ROAD_RADIUS,yi*ROAD_WIDTH]});
    map_array[x][y] = road;
    map_array[x][yi-1] = road;
    joinTop(x,y,map_array,road);
    return road;
}

function extractIntersectOfRoad(x,y,map_array){
    var intersect = new Intersection({point: [x*ROAD_WIDTH+ROAD_RADIUS,y*ROAD_WIDTH+ROAD_RADIUS]});
    map_array[x][y] = intersect; //dangerous overloading of javascript's capability for multi-type arrays
    joinTopAndLeft(x,y,map_array,intersect);
    return intersect;
}

function joinTop(x,y,map_array,road){
    if(y>1 && map_array[x][y-1] instanceof Road){
        if(!(map_array[x][y-1] instanceof Intersection) && !map_array[x][y-1].isVertical){
            // Need to check if the road is vertical for the join
        }else{
            joinRoads(map_array[x][y-1],road);
            //console.log("Joined "+x+","+y+" to top");
        }
    }
}

function joinLeft(x,y,map_array,road){
    if(x>1 && map_array[x-1][y] instanceof Road){
        if(!(map_array[x-1][y] instanceof Intersection) && map_array[x-1][y].isVertical){
            // Need to check if the road is NOT vertical for the join
        }else{
            joinRoads(road,map_array[x-1][y]);
            //console.log("Joined "+x+","+y+" to top");
        }
    }
}

function joinTopAndLeft(x,y,map_array,road){
    // Join with left
    joinTop(x,y,map_array,road);
    joinLeft(x,y,map_array,road);
}

var TILE_OPEN = 0;
var TILE_ROAD = 1;
var TILE_INTERSECTION = 2;

function generateRandomMapArray(map_width,map_height){ //map_width and height are the indice size of the array
    var map_total_area = map_height*map_width;
    var map_covered = 0.0;
    var target_coverage = 0.25;
    var reset_factor = 2;


    var map_array = initialiseMapArray(map_width,map_height);
    var list_worker = initialiseWorkerList(map_width,map_height);
    var choices = function(length){
        return {'die':(0.015*length),'intersect':(0.025*length),'make road':(0.96*length)}; //TODO: Change this to a non-linear function
    }

    //Keep going through list_p until end_condition is satified
    var i=0;
    while(map_covered/map_total_area<target_coverage){
          //pick a worker
          var worker = list_worker.shift();

          //move him along his direction
          workerMove(worker);

          if(worker.x<0 || worker.x>=map_width || worker.y<0 || worker.y>=map_height){
            //this poor worker has walked off the map
              if(list_worker.length>0){
                continue;
              }else{
                worker = {x:Math.round((map_width-1)*Math.random()), y:0, dir:[0,1], travelled:1};
              }
          }

          var outcome = chooseOutcomeWithProbability(choices(worker.travelled)); 

          switch(outcome) 
          {
            case 'intersect':
                if(map_array[worker.x][worker.y] == TILE_OPEN && 
                    noNearbyIntersection(worker.x,worker.y,map_array)){
                  map_array[worker.x][worker.y] = TILE_INTERSECTION;
                  list_worker = list_worker.concat(createNewWorkers(worker,map_height,map_width));
                  map_covered++;
                  break;
                  }

            case 'make road':
                if(map_array[worker.x][worker.y] == TILE_OPEN && 
                    noNearbyRoadInSameDir(worker.x,worker.y,worker.dir,map_array)){
                  map_array[worker.x][worker.y] = TILE_ROAD;
                  list_worker.push(worker);
                  map_covered++;
                }else if(map_array[worker.x][worker.y] == TILE_ROAD) {
                  //let worker die if he is stepping on a road
                }
                break;

            case 'die':
              if(list_worker.length==0){
                list_worker.push(worker);
              }
              //Give the worker a burial service
              break;
          }
          // console.log("map_covered: "+map_covered);
          // console.log('map_total_area: ' + map_total_area);
          //console.log('Coverage: '+map_covered/map_total_area);

          if(list_worker.length==0){
            list_worker.push({x:Math.round((map_width-1)*Math.random()),y:0,dir:[0,1]});
          }
          i++;
          if(i > reset_factor*map_total_area*target_coverage){
            map_array = initialiseMapArray(map_width,map_height);
            list_worker = initialiseWorkerList(map_width,map_height);
          } 
        
    }
    cleanUp(map_array);

    string = "[";
    for(i=0;i<map_array.length;i++){
      //console.log(map_array[i]);
      string += "["+map_array[i]+"],\n"
    }
    string+="]";
    //console.log(string);
    return map_array;
}

function initialiseMapArray(map_width,map_height){
  var map_array = Array();
  for(x=0;x<map_width;x++){
      map_array[x] = new Array();
      for(y=0;y<map_height;y++){
        map_array[x][y] = TILE_OPEN;
      }
  }
  return map_array;
}

function initialiseWorkerList(map_width,map_height){
  var first_worker = {x:Math.floor(map_width/10),y:-1, dir:[0,1], travelled:1}; //TODO: Might wanna change this up later for more randomness
  var list = [first_worker];
  return list;
}

function workerMove(worker){
    worker.x += worker.dir[0];
    worker.y += worker.dir[1];
    worker.travelled++;
}

function chooseOutcomeWithProbability(choices){
  var flip = Math.random();
  var keys = Object.keys(choices);
  var prob = 0.0;
  for(i=0;i<keys.length;i++){
    prob = prob+choices[keys[i]];
    if(flip<=prob){
      return keys[i];
    }
  }
}

function createNewWorkers(worker,map_height,map_width){
  var new_dir = removeByValue([[0,-1],[0,1],[-1,0],[1,0]],[-worker.dir[0],-worker.dir[1]]);
  var new_workers = Array();
  for(i=0;i<new_dir.length;i++){
    var new_worker = {x:worker.x, y:worker.y, dir:new_dir[i], travelled:1};
    new_workers.push(new_worker);
    // console.log('new intersection worker: ['+new_worker.x+','+new_worker.y+'] with dir ['+new_worker.dir[0]+','+new_worker.dir[1]+']');
  }
  return new_workers;
}

function removeByValue(arr, val) {
    var temp = Array();
    for(var i=0; i<arr.length; i++) {
        if(arr[i][0] != val[0] || arr[i][1]!=val[1]) {
            temp.push(arr[i]);
        }
    }
    return temp;
}

function noNearbyIntersection(x,y,map_array){
  if((isValidLocation(x-1,y,map_array) && map_array[x-1][y]==2) || 
    (isValidLocation(x-2,y,map_array) && map_array[x-2][y]==2)){
    return false;
  }
  if((isValidLocation(x+1,y,map_array) && map_array[x+1][y]==TILE_INTERSECTION) ||
      (isValidLocation(x+2,y,map_array) && map_array[x+2][y]==TILE_INTERSECTION)){
    return false;
  }
  if((isValidLocation(x,y-1,map_array) && map_array[x][y-1]==2) || 
    (isValidLocation(x,y-2,map_array) && map_array[x][y-2]==2)){
    return false;
  }
  if((isValidLocation(x,y+1,map_array) && map_array[x][y+1]==TILE_INTERSECTION) ||
      (isValidLocation(x,y+2,map_array) && map_array[x][y+2]==TILE_INTERSECTION)){
    return false;
  }

  return true;
}

function noNearbyRoadInSameDir(x,y,dir,map_array){
  arr = removeByValue(removeByValue([[0,-1],[0,1],[-1,0],[1,0]],dir),[-dir[0],-dir[1]]);
  for(i=0;i<arr.length;i++){
    loc_x = x+arr[i][0];
    loc_y = y+arr[i][1];
    if(!isValidLocation(loc_x,loc_y,map_array)){
      continue;
    }
    if(map_array[loc_x][loc_y]==TILE_ROAD){
      //console.log('logging false');
      return false;
    }
  }
  //console.log('logging true');
  return true;
}

function cleanUp(map_array){
    for(x=0;x<map_array.length;x++){
        for(y=0;y<map_array[0].length;y++){            
            // Change all single road tiles into intersections
            if(map_array[x][y]==TILE_ROAD && roadForeverAlone(x,y,map_array)){
                map_array[x][y] = TILE_INTERSECTION;
            }            

            // Change all road tiles at a crossroad into intersections
            if(map_array[x][y]==TILE_ROAD && roadAtIntersection(x,y,map_array)){
                map_array[x][y] = TILE_INTERSECTION;
            }
        }
    }
}

function roadForeverAlone(x,y,map_array){
    dir = [[0,-1],[0,1],[-1,0],[1,0]]
    for( d=0;d<dir.length;d++){
        if(isValidLocation(x+dir[d][0],y+dir[d][1],map_array) &&
            map_array[x+dir[d][0]][y+dir[d][1]]==TILE_ROAD){
            return false;
        }
    }
    return true;
}

function roadAtIntersection(x,y,map_array){
    if((isValidLocation(x+1,y,map_array) && map_array[x+1][y]==TILE_ROAD)||
        (isValidLocation(x-1,y,map_array) && map_array[x-1][y]==TILE_ROAD)){
            isVert = true;
        }else{
            isVert = false;
    }
    if((isValidLocation(x,y+1,map_array) && map_array[x][y+1]==TILE_ROAD)||
        (isValidLocation(x,y-1,map_array) && map_array[x][y-1]==TILE_ROAD)){
            isHort = true;
        }else{
            isHort = false;
    }

    if(isVert && isHort){
        return true;
    }else{
        return false;
    }
}

function isValidLocation(x,y,map_array){
    //This function assumes that the indices are zero-based
    if(x<0 || y<0 || x>map_array.length-1 || y>map_array[0].length-1){
        return false;
    }else{
        return true;
    }
}