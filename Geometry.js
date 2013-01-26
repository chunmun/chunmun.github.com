/*
Helper methods for Geometry and collision detection.

NOTE: Points are represented as an array e.g. point at x, y is [x, y].
            Line segments are represented as an array of points, e.g. from A to B is [A, B].
            Polygon is an n-array of points.
            Bezier Curve is an n-array of the control points. A cubic-degree bezier curve will have 4 points.
            
            Our coordinate system has x-positive to the right, and y-positive to the left.
            Angles in radians, with 0 at East, PI/2 at North.
*/
var Geometry = (function(){
    var g = {};



    // rotates point p (in format [x, y]) counterclockwise by angle.
    // does not mutate point.
    var rotatePoint = function(p, angle){
        var x = p[0], y = p[1];
        var q = [x, y];
        
        /*
         To rotate x, y by A,
         x' = x*cos(A) - y*sin(A)
         y' = x*sin(A) + y*cos(A)
        */
        var c = Math.cos(angle);
        var s = Math.sin(-angle);
        q[0] = x * c - y * s; // x'
        q[1] = x * s + y * c; // y'
        
        return q;
    };



    // translates point p by dx and dy.
    // does not mutate point.
    var translatePoint = function(p, dx, dy){
        return [p[0] + dx, p[1] + dy];
    };



    /*
     Determines whether p3 lies to the left (ccw) of line p1, p2.
     Each point (p1, p2, p3) is an array [x, y].
     
     Returns > 0 if p3 lies to the left,
             = 0 if p3 is colinear,
             < 0 if p3 lies to the right.
    */
    var ccw = function(p1, p2, p3){
        return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
    };
    
    
    
    var midpoint = function(line){
        return [(line[0][0] + line[1][0]) / 2,
                        (line[0][1] + line[1][1]) / 2];
    };



    /*
     Determines whether two finite length lines intersect.
     Each line is an array of points, [p1, p2].
     
     Returns true if they intersect, false otherwise.
    */
    var linesIntersect = function(l1, l2){
        var p1 = l1[0], p2 = l1[1];
        var p3 = l2[0], p4 = l2[1];
        return ccw(p1, p2, p3) * ccw(p1, p2, p4) < 0 &&
               ccw(p3, p4, p1) * ccw(p3, p4, p2) < 0;
    };



    /*
     Determines whether two polygons intersect.
     Brute algorithm, determine whether any lines intersect.
     
     Each polygon is expected to be an array of points. Polygons are
     assumed to not self-intersect.
     
     Time complexity O(mn), for number of vertices m and n.
    */
    var polygonsIntersect = function(poly1, poly2){
        var n = poly1.length;
        for(var i = 0; i < poly1.length; i++){
            var line1 = [poly1[i], poly1[(i + 1) % n]];
            
            if(linePolygonIntersect(line1, poly2)){
                return true;
            }
        }
        
        return false;
    };



    var linePolygonIntersect = function(line, poly){
        var n = poly.length;
        for(var i = 0; i < poly.length; i++){
            line2 = [poly[i], poly[(i + 1) % n]];
            
            if(linesIntersect(line, line2)){
                return true;
            }
        }
        
        return false;
    };



    /*
        Count how many lines in in polygon intersect with
        the given line.
    */
    var countLinePolygonIntersect = function(line, poly){
        var count = 0;
        var n = poly.length;
        for(var i = 0; i < poly.length; i++){
            line2 = [poly[i], poly[(i + 1) % n]];
            
            if(linesIntersect(line, line2)){
                count += 1;
            }
        }
        
        return count;
    };
    
    
    
    var isLineSegmentOrthoganal = function(line){
        // Either x's is equal, or y's are equal.
        return line[0][0] === line[1][0] ||
                     line[0][1] === line[1][1];
    };
    
    
    
    var boundingBoxForPolygon = function(poly) {
        var minX = poly[0][0], maxX = poly[0][0];
        var minY = poly[0][1], maxY = poly[0][1];
        
        for(var i = 1; i < poly.length; i++){
            var tx = poly[i][0];
            var ty = poly[i][1];
            
            if(tx < minX){
                minX = tx;
            } else if(tx > maxX){
                maxX = tx;
            }
            
            if(ty < minY){
                minY = ty;
            } else if(ty > maxY){
                maxY = ty;
            }
        }
        
        var width = maxX - minX;
        var height = maxY - minY;
        
        return [minX, minY, width, height];
    }
    
    
    
    var pointInPolygon = function(pt, poly){
        /*
            The idea is to count the number of line intersections
            with the polygon against some line segment which goes from
            the given point, to outside the polygon.
        */
        
        // O(n), but to ensure our 'ray' goes
        // outside the polygon.
        var bbox = boundingBoxForPolygon(poly);
        
        // Line segment to check against. 
        var ray = [[bbox[0] - 1, pt[1]], pt];
        
        // O(n)
        return (countLinePolygonIntersect(ray, poly) % 2) === 1;
    };
    
    
    
    function fact(n){ return (n < 2) ? 1 : n * fact(n - 1); };
    function C(n, r){ return fact(n) / (fact(r) * fact(n - r)); };
    var evaluateCurve = function(curve, t){
        /*
          Returns a point by evaluating the curve at the parameter t.
          (where t is between 0 and 1).
        */
    
        var tx = 0;
        var ty = 0;
        
        var n = curve.length - 1;
        for(var i = 0; i <= n; i++){
            // See explicit formula of Bezier curve.
            var c = C(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);
            tx += c * curve[i][0];
            ty += c * curve[i][1];
        }
        
        return [tx, ty];
    };
    
    
    
    function sub(pt1, pt2){ return [pt2[0] - pt1[0], pt2[1] - pt1[1]]; };
    function magnitude(pt){ return Math.sqrt(pt[0]*pt[0] + pt[1]*pt[1]); };
    var estimateLength = function(curve, k){
        /*
          Estimate the length of the curve by sampling k + 1 points,
           and summing the distance between these.
        */
        
        var result = 0;
        
        var prevPt = evaluateCurve(curve, 0);
        var currPt;
        
        for(var i = 1; i <= k; i++){
            currPt = evaluateCurve(i / k);
            
            result += magnitude(sub(currPt, prevPt));
            
            prevPt = currPt;
        }
        
        return result;
    }



    g.rotatePoint = rotatePoint;
    g.translatePoint = translatePoint;
    g.ccw = ccw;
    g.midpoint = midpoint;
    g.linesIntersect = linesIntersect;
    g.linePolygonIntersect = linePolygonIntersect;
    g.polygonsIntersect = polygonsIntersect;
    g.isLineSegmentOrthoganal = isLineSegmentOrthoganal;
    g.boundingBoxForPolygon = boundingBoxForPolygon;
    g.pointInPolygon = pointInPolygon;
    g.evaluateCurve = evaluateCurve;
    g.estimateLength = estimateLength;

    return g;
}());