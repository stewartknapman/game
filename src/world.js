/*
  World has layers
  a layer can be of type map or type object
  
  A layer has a render method
  
  Each state has a new world
  the state renders the world
  this means the world is acessable from inside the state
  
*/
var LayerMap = require('./layer_map.js');

var World = function (canvas, camera) {
  this.canvas = canvas;
  this.camera = camera;
  this.layers = [];
  
  this.setSize(canvas.width, canvas.height);
};

World.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
  this.camera.updateWorldBounds(width, height);
};

World.prototype.newMapLayer = function (mapID, numRows, numCols, tileWidth, tileHeight, map, sprite, tileStyle) {
  var layer = new LayerMap(this.canvas, this.camera, mapID, numRows, numCols, tileWidth, tileHeight, map, sprite, tileStyle);
  this.layers.push(layer);
  return layer;
};

World.prototype.newObjectLayer = function (worldX, worldY, width, height) {
  // TODO
  // needs render method where the object is drawn or sprite is added to context
  // do we have a second method or animating?
};

World.prototype.render = function () {
  this._eachLayer(function (layer) {
    layer.render();
  });
};

// Private

World.prototype._eachLayer = function (callback) {
  for (var l = 0; l < this.layers.length; l++) {
    var layer = this.layers[l];
    if (callback) {
      callback.apply(this, [layer]);
    }
  }
};

module.exports = World;