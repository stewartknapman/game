/*
  TODO:
    - world vs camera/ world largr than canavs; player centered to canvas
    - collision detection
*/

var CanvasManager = require('./canvas_manager.js');
var StateManager = require('./state_manager.js');
var Loop = require('./loop.js');

var Game = function (canvasSelector, scaleType) {
  this.canvas = new CanvasManager(canvasSelector, scaleType);
  this.stateManager = new StateManager();
  this.loop = new Loop(this.canvas, this.stateManager);
  
  Object.defineProperty(this, 'isRunning', {
    get: function () {
      return this.loop.isRunning;
    }
  });
  
  this._addEventListeners();
};

// Set up states
Game.prototype.newState = function (stateId, stateObj) {
  this.stateManager.addState(stateId, stateObj, this.canvas);
};

Game.prototype.loadState = function (stateId) {
  this.stateManager.loadState(stateId);
};

// Start and Stop Loop

Game.prototype.start = function () {
  this.loop.startLoop();
};

Game.prototype.stop = function () {
  this.loop.stopLoop();
};

// Private

Game.prototype._addEventListeners = function () {
  var game = this;
  this.canvas.on('resize', function () {
    game.stateManager.resizeCurrentState();
  });
};

module.exports = Game;