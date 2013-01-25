/*
  Map.js - for Project Debora, GGJ2013.
  
  The map is responsible for maintaining Paths and Traps.
*/

function Map(args){
    this.waypoints = args.waypoints || [];
    this.paths = args.paths || [];
    this.traps = args.traps || [];
}



function createDefaultMap(){
    /*
      The intention of the default map is to have just two waypoints,
       and a path which has a basic circle around the map.
       (This may get more complicated; but this is to be in place
        of a level designer 'till one is up + running).        
    */
    
    var mapWidth = GAME_WIDTH;   // 640
    var mapHeight = GAME_HEIGHT; // 480

    // A couple of Waypoints
    var wp1 = [0 + 50, mapHeight / 2];
    var wp2 = [mapWidth - 50, mapHeight / 2];
    
    // Some curves for the path.
    // These points are ordered counter-clockwise.
    var cp1 = [mapWidth - 50, 50]; // topright
    var cp2 = [50, 50]; // topleft
    var cp3 = [50, mapHeight - 50]; // botleft
    var cp4 = [mapWidth - 50, mapHeight - 50]; // botright
    
    var bc1 = [wp1, cp1, cp2, wp2]; // ccw order
    var bc2 = [wp2, cp3, cp4, wp1]; // ccw order
    
    var path1 = new Path({wpStart: wp1,
                         wpEnd: wp2,
                         curve: bc1});
    var path2 = new Path({wpStart: wp2,
                         wpEnd: wp1,
                         curve: bc2});
    
    var tmap = new Map({waypoints: [wp1, wp2],
                        paths: [path1, path2],
                        traps: []});
        
    return tmap;
}