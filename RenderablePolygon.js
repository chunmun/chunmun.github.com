/*
Creates or Augments an object so that it renders a polygon shape.
Object needs to be a moving object.

args may contain args for a moving object.
args expects polyCoords.

polyCoords is an array of [x,y] arrays. Do not repeat the last and first item.
*/
function RenderablePolygon(args){
    if(!args){
      return;
    }
    
    MovingObject.call(this, args);
    
    this.polyCoords = args.polyCoords;
}
RenderablePolygon.prototype = new MovingObject({});



/*
 Calculates the polygon coordinates for the moving object,
 and returns the calculated value.
*/
RenderablePolygon.prototype.calculatePolygonCoordinates = function(){
    // Transform point by movingObj's x, y, viewAngle.
    function transformPoint(p){
        // Rotate, then translate
        q = Geometry.rotatePoint(p, this.getViewAngle());
        q = Geometry.translatePoint(q, this.getX(), this.getY());
    
        return q;
    }
    
    return this.polyCoords.map(transformPoint.bind(this));
}



/*
 Returns a box which is the minimal rectangle which contains all
 vertices of the polygon.
 
 Time complexity O(n), by number of points.
 
 The box is returned in form of [x, y, w, h].
*/
RenderablePolygon.prototype.getBoundingBox = function(){
    return Geometry.boundingBoxForPolygon(this.calculatePolygonCoordinates());
}



// Checks whether this collides with another RenderablePolygon
// O(mn) time complexity.
RenderablePolygon.prototype.collidesWith = function(polyObj){
    // Check that the other object has the right methods
    if(!polyObj.getBoundingBox || !polyObj.calculatePolygonCoordinates){
        return false;
    }
    
    // Check whether the bounding boxes overlap before
    // calculating whether they intersect.
    // O(m + n)
    var rectA = this.getBoundingBox();
    var rectB = polyObj.getBoundingBox();
    var collisionMightExist = (rectA[0] + rectA[2] >= rectB[0] && rectA[0] <= rectB[0] + rectB[2]) &&
                              (rectA[1] + rectA[3] >= rectB[1] && rectA[1] <= rectB[1] + rectB[3]);
    
    if(!collisionMightExist){
        return false;
    }
    
    // A collision might exist,
    // check that it does.
    // O(mn)
    var poly1 = this.calculatePolygonCoordinates();
    var poly2 = polyObj.calculatePolygonCoordinates();
    return Geometry.linePolygonIntersect([[this.getPreviousX(), this.getPreviousY()],
                                          [this.getX(), this.getY()]],
                                          poly2) ||
           Geometry.linePolygonIntersect([[polyObj.getPreviousX(), polyObj.getPreviousY()],
                                          [polyObj.getX(), polyObj.getY()]],
                                          poly1) ||
           Geometry.polygonsIntersect(poly1, poly2);
};



RenderablePolygon.prototype.render = function(context){
    var x = this.getX();
    var y = this.getY();
    var va = this.getViewAngle();
    
    context.beginPath();
    
    // Angle here, 0 is at EAST, PI/2 is at NORTH.
    var coords = this.calculatePolygonCoordinates();
    
    context.moveTo(coords[0][0], coords[0][1]);
    for(var i = 1; i < this.polyCoords.length; i++){
        context.lineTo(coords[i][0], coords[i][1]);
    }
    context.lineTo(coords[0][0], coords[0][1]);
    
    context.strokeStyle = "#000000";
    context.lineWidth = 1;
    context.closePath();
    context.stroke();
    
    //Fill in the shape
    if(this.fillColor){
        context.fillStyle = this.fillColor;
        context.fill();
    }
}



RenderablePolygon.prototype.equals = function (o){
    // Check mobj equality first.
    if(!MovingObject.prototype.equals.call(this, o)){
        return false;
    }
    
    var o_coords = o.getPolygonCoordinates();
    
    if(this.polyCoords.length != o_coords.length){ // same number of coords.
        return false;
    }
    
    // Check all coordinates are the same.
    for(var i = 0; i < this.polyCoords.length; i++){
        if(Math.abs(o_coords[i][0] - this.polyCoords[i][0]) > 0.0001 ||
           Math.abs(o_coords[i][1] - this.polyCoords[i][1]) > 0.0001){
            return false;
        }
    }
    
    return true;
};



RenderablePolygon.prototype.getPolygonCoordinates = function(){ return this.polyCoords; };
