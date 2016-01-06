var World = require('./world.js');
var Camera = require('./camera');

var State = function (id, object, canvas) {
  this.id = id;
  this.canvas = canvas;
  this.camera = new Camera(canvas);
  this.world = new World(canvas, this.camera);
  
  this._setMethods(object);
};

State.prototype.init = function () {};    // is called when the state is loaded
State.prototype.resize = function () {};  // is called when the screen is resized
State.prototype.destroy = function () {}; // is called when a new state is loaded
State.prototype.update = function () {    // is called during the game loop; is used for updating game logic
  this.world.update();
};

// is called after init, update and resize and redraws the canvas
State.prototype.render = function () {
  this.camera.update();
  this.world.render();
};

// private

State.prototype._setMethods = function (object) {
  for (var method in object) {
    // don't override render method
    if (object.hasOwnProperty(method) && method !== 'render') {
      // make sure update still calls world update
      if (method === 'update') {
        this.update = function () {
          this.world.update();
          object.update.apply(this);
        };
      } else {
        this[method] = object[method];
      }
    }
  }
};

module.exports = State;