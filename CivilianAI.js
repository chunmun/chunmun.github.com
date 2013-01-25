/*
  CivilianAI.js - for controlling the civilians.
*/

/*
  Perform a civilian move for the Zombie, for the given CityMap
*/
function do_civilian_move(delta, civilian, cityMap, influencers){
    // Zombie movement unconstrained
    // TODO: Constrain it, so as to only move within roads.

    var oldPt = [civilian.getX(), civilian.getY()];
    civilian.move(delta);

    var pt = [civilian.getX(), civilian.getY()];
    var road = cityMap.getRoadAt(pt);

    if(!road){
        console.log("could not find road at " + pt);
        throw "civilian not in cityMap anymore wut."
    }

    // Check if we're moving outside road
    var isectDir = road.getIntersectsDirection(civilian);
    if(isectDir >= 0){ // If we're intersecting with a road exit.
        var hasNeighbourInDirection = road.getAdjacentRoads()[isectDir];
        
        if(!hasNeighbourInDirection){
            /*
              There's not a "neighbour" in the direction we're trying to head,
              i.e. no road, so we need to head back in the other direction.
            */
            civilian.setX(oldPt[0]);
            civilian.setY(oldPt[1]);
            if(isectDir === ROAD_DIRECTION_NORTH ||
               isectDir === ROAD_DIRECTION_SOUTH){
                // Reverse Vertical direction.
                civilian.setMoveAngle(2 * Math.PI - civilian.getMoveAngle());
            } else if(isectDir === ROAD_DIRECTION_EAST ||
                      isectDir === ROAD_DIRECTION_WEST){
                
                civilian.setMoveAngle(Math.PI - civilian.getMoveAngle());
            }
            
            do_civilian_move(delta, civilian, cityMap); // Think about the move again.
        }
    }

    if(!road.equals(civilian.getCurrentRoad())){
        // Zombie has now moved to a different road,
        // point the little fella to a new, different road
        civilian.setCurrentRoad(road);
    }

    var destPt = civilian.getDestinationPoint();
    if(civilian.getDistanceToPoint(destPt) < ZOMBIE_SQUARE_HALFWIDTH){
        // If we get close to our destination point,
        // change where our destination is.
        
        var adjRds = road.getAdjacentRoads().filter(function(rd){
                                                        return !rd.equals(civilian.getPreviousRoad());
                                                    });
        
        function findDestinationPointForRoad(anotherRoad){
            // Return the point which is close to the furthest
            // & opposite exit from the current road.
            // NOTE: anotherRoad is a neighbour of road.
            var dir = road.findDirectionToNeighbour(anotherRoad);
            var nextExit = anotherRoad.getExitInDirection(dir);
            var pt = Geometry.midpoint(nextExit);
            
            switch(dir){
                case ROAD_DIRECTION_EAST:
                    return [pt[0] - ROAD_RADIUS, pt[1]];
                case ROAD_DIRECTION_WEST:
                    return [pt[0] + ROAD_RADIUS, pt[1]];
                case ROAD_DIRECTION_NORTH:
                    return [pt[0], pt[1] + ROAD_RADIUS];
                case ROAD_DIRECTION_SOUTH:
                    return [pt[0], pt[1] - ROAD_RADIUS];
                default:
                    return pt;
            }
        }
        
        var nextPt = null;
        if(adjRds.length === 0){
            // Nowhere to go, head back to previous road.
            nextPt = findDestinationPointForRoad(civilian.getPreviousRoad());
        } else {
            var sel = Math.floor(Math.random() * adjRds.length);
            var nextRoad = adjRds[sel];
            nextPt = findDestinationPointForRoad(nextRoad);
        }
        civilian.setDestinationPoint(nextPt);
        
        var relY = (nextPt[1] - pt[1]);
        var relX = (nextPt[0] - pt[0]);
        var theta = Math.atan2(relY, relX);
        civilian.setMoveAngle(- theta);
    }
}
