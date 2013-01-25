/*
  ZombieAI.js - for controlling the zombies.
*/

/*
  Perform a zombie move for the Zombie, for the given CityMap
*/
function do_zombie_move_smarter(delta, zombie, cityMap, influencers){
    // Zombie movement unconstrained
    // TODO: Constrain it, so as to only move within roads.

    var oldPt = [zombie.getX(), zombie.getY()];
    var tries = 1;
    do{
        if(tries>10){
            console.log("This is really bad");
            delta = 0;
        }
        zombie.move(delta/tries);

        var pt = [zombie.getX(), zombie.getY()];
        var road = cityMap.getRoadAt(pt);
    }while(!road);
    // if(!road){
    //     console.log("could not find road at " + pt);
    //     throw "zombie not in cityMap anymore wut."
    // }

    // Check if we're moving outside road
    var isectDir = road.getIntersectsDirection(zombie);
    if(isectDir >= 0){ // If we're intersecting with a road exit.
        var hasNeighbourInDirection = road.getAdjacentRoads()[isectDir];
        
        if(!hasNeighbourInDirection){
            /*
              There's not a "neighbour" in the direction we're trying to head,
              i.e. no road, so we need to head back in the other direction.
            */
            var zBBox = zombie.getBoundingBox();
            var rdBBox = road.getBoundingBox();
            
            switch(isectDir){
                case ROAD_DIRECTION_NORTH:
                    // Reverse Vert. Direction
                    zombie.setX(oldPt[0]);
                    zombie.setY(rdBBox[1] + ZOMBIE_SQUARE_HALFWIDTH + 1);
                    zombie.setMoveAngle(2 * Math.PI - zombie.getMoveAngle());
                    break;
                case ROAD_DIRECTION_SOUTH:
                    // Reverse Vert. Direction
                    zombie.setX(oldPt[0]);
                    zombie.setY(rdBBox[1] + rdBBox[3] - ZOMBIE_SQUARE_HALFWIDTH - 1);
                    zombie.setMoveAngle(2 * Math.PI - zombie.getMoveAngle());
                    break;
                case ROAD_DIRECTION_WEST:
                    // Reverse Horiz. Direction
                    zombie.setX(rdBBox[0] + ZOMBIE_SQUARE_HALFWIDTH + 1);
                    zombie.setY(oldPt[1]);
                    zombie.setMoveAngle(Math.PI - zombie.getMoveAngle());
                    break;
                case ROAD_DIRECTION_EAST:
                    // Reverse Horiz. Direction
                    zombie.setX(rdBBox[0] + rdBBox[2] - ZOMBIE_SQUARE_HALFWIDTH - 1);
                    zombie.setY(oldPt[1]);
                    zombie.setMoveAngle(Math.PI - zombie.getMoveAngle());
                    break;
            }
            
            //do_zombie_move_smarter(delta, zombie, cityMap); // Think about the move again.
        }
    }

    if(!road.equals(zombie.getCurrentRoad())){
        // Zombie has now moved to a different road,
        // point the little fella to a new, different road
        zombie.setCurrentRoad(road);
    }

    var destPt = zombie.getDestinationPoint();
    if(zombie.getDistanceToPoint(destPt) < ZOMBIE_SQUARE_HALFWIDTH){
        // If we get close to our destination point,
        // change where our destination is.
        
        var adjRds = road.getAdjacentRoads().filter(function(rd){
                                                        return !rd.equals(zombie.getPreviousRoad());
                                                    });
        
        
        
        function getDestPointInDirection(rd, dir){
            var nextExit = rd.getExitInDirection(dir);
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
        
        function limitMovementPoint(pt){
            pt[0] = (pt[0]>GAME_WIDTH ? GAME_WIDTH : pt[0]);
            pt[0] = (pt[0]<0 ? 0 : pt[0]);
            pt[1] = (pt[1]>GAME_HEIGHT ? GAME_HEIGHT : pt[1]);
            pt[1] = (pt[1]<0 ? 0 : pt[1]);
            return pt;
        }
        
        function findDestinationPointForRoad(anotherRoad){
            // Return the point which is close to the furthest
            // & opposite exit from the current road.
            // NOTE: anotherRoad is a neighbour of road.
            var dir = road.findDirectionToNeighbour(anotherRoad);
            return getDestPointInDirection(anotherRoad, dir);
        }
        
        var nextPt = null;
        if(adjRds.length === 0){
            // Nowhere to go, head back to previous road.
            nextPt = findDestinationPointForRoad(zombie.getPreviousRoad());
        } else {
            var sel = Math.floor(Math.random() * adjRds.length);
            var nextRoad = adjRds[sel];
            nextPt = findDestinationPointForRoad(nextRoad);
        }
        nextPt = limitMovementPoint(nextPt);
        zombie.setDestinationPoint(nextPt);
        
        var relY = (nextPt[1] - pt[1]);
        var relX = (nextPt[0] - pt[0]);
        var theta = Math.atan2(relY, relX);
        zombie.setMoveAngle(- theta);

        if(influencers && influencers.length > 0){
            /*
              This clause handles "influence".
              
              Limitations:
              * MovingInfluencer assumed
              * Only works for the first MovementInfluencer found.
              * Only works when Zombie reaches intersection.
            */
            for(var i=0;i<influencers.length;i++){
                if(influencers[i] instanceof MovementInfluencer){
                    influencers[i].invoke(zombie);
                    break;
                }
            }
        }
    }
    if(influencers && influencers.length>0){
        for(var i=0;i<influencers.length;i++){
            if(!(influencers[i] instanceof MovementInfluencer)){
                influencers[i].invoke(zombie);
            }
        }
    }
}

/*
  Perform a zombie move for the Zombie, for the given CityMap
*/
function do_zombie_move(delta, zombie, cityMap){
    // Zombie movement unconstrained
    // TODO: Constrain it, so as to only move within roads.
    zombie.move(delta);

    var pt = [zombie.getX(), zombie.getY()];
    var road = cityMap.getRoadAt(pt);

    if(!road){
        console.log("could not find road at " + pt);
        throw "zombie not in cityMap anymore wut."
    }

    if(!road.equals(zombie.getCurrentRoad())){
        // Zombie has now moved to a different road,
        // point the little fella to a new, different road
        zombie.setCurrentRoad(road);

        var adjRds = road.getAdjacentRoads().filter(function(rd){
                                                        return !rd.equals(zombie.getPreviousRoad());
                                                    });

        if(adjRds.length === 0){
            // Nowhere to go ... head end of road anyhow.

            road.getExitInDirection(road.findDirectionToNeighbour(zombie.getPreviousRoad()));
        } else {
            var nextRoad = adjRds[Math.floor(Math.random() * adjRds.length)];

            var nextExit = road.getExitInDirection(road.findDirectionToNeighbour(nextRoad));
            var nextPt = Geometry.midpoint(nextExit);
            zombie.setDestinationPoint(nextPt);
            console.log("Next Destination Point: " + nextPt);
        }
    }
}
