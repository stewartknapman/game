/*
  World has layers
  a layer can be of type map or type object
  
  A layer has a render method
  
  Each state has a new world
  the state renders the world
  this means the world is acessable from inside the state
  
*/
var LayerMap = require('./layer_map.js');
var LayerObject = require('./layer_object.js');
var Collider = require('./collider.js');

var World = function (canvas, camera) {
  this.canvas = canvas;
  this.camera = camera;
  this.layers = [];
  this.collider = new Collider(canvas);
  
  this.setSize(canvas.width, canvas.height);
};

// Setup/Init methods

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

World.prototype.newObjectLayer = function (objectID, x, y, width, height, sprite, behaviors) {
  var layer = new LayerObject(this.canvas, this.camera, objectID, x, y, width, height, sprite, behaviors);
  this.layers.push(layer);
  return layer;
};

// Loop Methods

World.prototype.update = function () {
  this._eachOfType('LayerObject', function (layer) {
    layer.update();
  });
};

World.prototype.render = function () {
  this._eachLayer(function (layer) {
    layer.render();
  });
};

// Misc

World.prototype.collides = function (primaryColliderObject, secondaryColliderObject) {
  // if no secondary collision object then check against the bounds of the world
  if (secondaryColliderObject) {
    return this.collider.collides(primaryColliderObject, secondaryColliderObject);
  } else {
    return this.collider.collidesWithWorldBounds(primaryColliderObject, this);
  }
};

World.prototype.getLayerByID = function (id) {
  var layer = false;
  if (id) {
    this._eachLayer(function (l) {
      if (l.id === id) {
        layer = l;
      }
    });
  }
  return layer;
};

// Private

World.prototype._eachOfType = function (type, callback) {
  if (type) {
    this._eachLayer(function (layer) {
      if (layer.TYPE === type) {
        callback.apply(this, [layer]);
      }
    });
  }
};

World.prototype._eachLayer = function (callback) {
  for (var l = 0; l < this.layers.length; l++) {
    var layer = this.layers[l];
    if (callback) {
      callback.apply(this, [layer]);
    }
  }
};

module.exports = World;