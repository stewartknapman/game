/*
  
  A colliding object should have a flag that says weather it is collidable
  this allows things to be passed through if need be.
  
  A collider will have a master object that is always checked
  and a set of collidable objects which the master is checked against
  
  The test for colliding may differ between layerMap vs layerObject and layerObject vs layerObject?
  There is no (foreseeable) case to check layerMap vs layerMap
  
  an item can collide agains the worlds bounds
  
  A collider has a shape with a width and height which acts as the bounds to check against when detecing collisions
  
*/

var Collider = function (canvas) {
  this.canvas = canvas;
};

// at the very least an object needs to have x,y,width,height
Collider.prototype.collides = function (primaryCollider, secondaryCollider) {
//   console.log(primaryCollider, secondaryCollider);
  if (secondaryCollider.TYPE && secondaryCollider.TYPE === 'LayerMap') {
    // Detect 1 object against a map
    return this.collidesWithMap(primaryCollider, secondaryCollider);
  } else {
    // Detect against 2 objects
    return this.collidesWithObject(primaryCollider, secondaryCollider);
  }
};

Collider.prototype.collidesWithMap = function (primaryObject, map) {
  // get the tile at the x & y of the primaryObject
  // if it is solid (> 0) then we have a collision
  var col = Math.floor(primaryObject.x / map.tileWidth);
  var row = Math.floor(primaryObject.y / map.tileWidth);
  var tile = map.getMapTile(col, row);
  return tile > 0;
};

Collider.prototype.collidesWithObject = function (primaryObject, secondaryObject) {
};

Collider.prototype.collidesWithWorldBounds = function (primaryObject, world) {
  // TODO detect against world bounds
};

module.exports = Collider;