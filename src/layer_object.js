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
  this.sprite = false; // <-- TODO
  
  Object.defineProperty(this, '_isFollowed', {
    get: function () {
      return this.camera.following && this.camera.following === this;
    }
  });
};

LayerObject.prototype.render = function () {
  // x & y offset by camera
  var x = -this.camera.x + this.x;
  var y = -this.camera.y + this.y;
  if (this._isFollowed) {
    x = this.screenX;
    y = this.screenY;
  }
  
  if (this.sprite) {
    // TODO
  } else {
    this.draw(x, y);
  }
};

LayerObject.prototype.draw = function (x, y) {};

module.exports = LayerObject;