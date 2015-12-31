/*
  TODO:
    - pause/stop on window blur
    - world vs camera/ world largr than canavs; player centered to canvas
    - collision detection
    - rename window size manager and use height mq's as well as width ones
*/

var CanvasManager = require('./canvas_manager.js');
var StateManager = require('./state_manager.js');
var Loop = require('./loop.js');

var Game = function (canvasSelector, scaleType) {
  this.canvas = new CanvasManager(canvasSelector, scaleType);
  this.stateManager = new StateManager(this.canvas);
  this.loop = new Loop(this.stateManager);
  this.isRunning = false;
  
  this._addEventListeners();
};

// Set up states
Game.prototype.newState = function (stateId, stateObj) {
  this.stateManager.addState(stateId, stateObj);
};

Game.prototype.loadState = function (stateId) {
  this.stateManager.loadState(stateId);
};

// Start and Stop(?)

Game.prototype.start = function () {
  this.isRunning = true;
  this.loop.startLoop();
};

Game.prototype.stop = function () {
  this.isRunning = false;
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