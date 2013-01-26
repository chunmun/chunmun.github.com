/*
  Map.js - for Project Debora, GGJ2013.
  
  The map is responsible for maintaining Paths and Traps.
*/

function Map(args){
    this.waypoints = args.waypoints || [];
    this.paths = args.paths || [];
    this.traps = args.traps || [];
}



Map.prototype.renderMapPathData = function(ctx){
    // Render waypoints
    
    
    // Render path curves
    var renderPath = function(path){        
        var curve = path.curve;
        
        // render control points.
        context.beginPath();
        context.moveTo(curve[0][0], curve[0][1]);
        for(var i = 1; i < curve.length; i++){
            context.lineTo(curve[i][0], curve[i][1]);
        }
        
        context.strokeStyle = "#00FF00";
        context.lineWidth = 1;
        context.stroke();
    
        // Render bezier curve..
        context.beginPath();
        
        var pt = Geometry.evaluateCurve(curve, 0);
        var k = 50; // arbitrary constant; how precise to render curve.
        
        // Sample points from the curve and render lines
        //  between them.
        context.moveTo(pt[0], pt[1]);
        for(var i = 1; i <= k; i++){
            pt = Geometry.evaluateCurve(curve, i / k);
            context.lineTo(pt[0], pt[1]);
        }
        
        context.strokeStyle = "#FF0000";
        context.lineWidth = 5;
        context.stroke();
    };
    
    this.paths.forEach(renderPath);
}



function createDefaultMap(){
    /*
      The intention of the default map is to have just two waypoints,
       and a path which has a basic circle around the map.
       (This may get more complicated; but this is to be in place
        of a level designer 'till one is up + running).        
    */
    
    var mapWidth = 640;//GAME_WIDTH;   // 640
    var mapHeight =480;// GAME_HEIGHT; // 480

    // A couple of Waypoints
    var wpt1 = [0 + 50, mapHeight / 2];
    var wp1 = new Waypoint({x: wpt1[0],
                            y: wpt1[1]});
    var wpt2 = [mapWidth - 50, mapHeight / 2];
    var wp2 = new Waypoint({x: wpt2[0],
                            y: wpt2[1]});
    
    // Some curves for the path.
    // These points are ordered counter-clockwise.
    var cp1 = [mapWidth - 50, 50]; // topright
    var cp2 = [50, 50]; // topleft
    var cp3 = [50, mapHeight - 50]; // botleft
    var cp4 = [mapWidth - 50, mapHeight - 50]; // botright
    
    var bc1 = [wpt2, cp1, cp2, wpt1]; // ccw order
    //var bc2 = [wpt1, cp3, cp4, wpt2]; // ccw order
    var bc2 = [wpt2, cp4, cp3, wpt1]; // ccw order
    
    var path1 = new Path({wpStart: wp1,
                         wpEnd: wp2,
                         curve: bc1});
    var path2 = new Path({wpStart: wp2,
                         wpEnd: wp1,
                         curve: bc2});
    
    var tmap = new Map({waypoints: [wp1, wp2],
                        paths: [path1, path2], //
                        traps: []});
        
    return tmap;
}