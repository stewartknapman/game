/*
  
  A colliding object should have a flag that says weather it is collidable
  this allows things to be passed through if need be.
  
  A collider will have a master object that is always checked
  and a set of collidable objects which the master is checked against
  
  The test for colliding may differ between layerMap vs layerObject and layerObject vs layerObject?
  There is no (foreseeable) case to check layerMap vs layerMap
  
  A collider has a shape with a width and height which acts as the bounds to check against when detecing collisions
  
*/

var Collider = function () {
  
};

module.exports = Collider;