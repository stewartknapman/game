var Camera = function (canvas) {
  this.canvas = canvas;
  this.x = 0;
  this.y = 0;
  this.maxX = 0;
  this.maxY = 0;
  this.width = canvas.width;
  this.height = canvas.height;
  this.following = false;
  
  this._addEventListeners();
};

Camera.prototype.moveTo = function (x, y) {
  this.x = x;
  this.y = y;
  
  // clamp values so that they can not got outside the bounds of the world
  this.x = Math.max(0, Math.min(this.x, this.maxX));
  this.y = Math.max(0, Math.min(this.y, this.maxY));
};

Camera.prototype.follow = function (obj) {
  this.following = obj;
  this.following.screenX = 0;
  this.following.screenY = 0;
};

Camera.prototype.update = function () {
  // TODO: https://github.com/mozdevs/gamedev-js-tiles/blob/gh-pages/square/logic-grid.js#L76-L102
};

Camera.prototype.updateWorldBounds = function (worldWidth, worldHeight) {
  // retain the worlds width and height so that we can reuse it if the screen is resized
  this.worldWidth = worldWidth || this.worldWidth;
  this.worldHeight = worldHeight || this.worldHeight;
  
  // if the cameras width and height are smaller than the worlds width and height
  // allow it to move. Else keep it locked to 0,0
  this.maxX = (this.width < this.worldWidth)? this.worldWidth - this.width : 0;
  this.maxY = (this.height < this.worldHeight)? this.worldHeight - this.height : 0;
  
  // Update the current x & y vals if they are now outside the max bounds
  if (this.x > this.maxX) {
    this.x = this.maxX
  }
  if (this.y > this.maxY) {
    this.y = this.maxY
  }
};

// Private

Camera.prototype._addEventListeners = function () {
  var camera = this;
  this.canvas.on('resize', function () {
    camera.width = camera.canvas.width;
    camera.height = camera.canvas.height;
    camera.updateWorldBounds();
  });
};

module.exports = Camera;