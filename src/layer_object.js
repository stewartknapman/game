/*
  TODO:
  sprite: also needs to know sprite width & height and image width & height
  if sprite width > image width then animate sprite?
*/

var LayerObject = function (canvas, camera, objectID, x, y) {
  this.canvas = canvas;
  this.camera = camera;
  this.id = objectID;
  this.x = x || this.camera.width / 2;
  this.y = y || this.camera.height / 2;
};

LayerObject.prototype.render = function () {
  this.draw(this.x, this.y);
};

LayerObject.prototype.draw = function (x, y) {};

module.exports = LayerObject;