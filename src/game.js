var CanvasManager = require('./canvas_manager.js');
var StateManager = require('./state_manager.js');
var Loop = require('./loop.js');

var Game = function (canvasSelector, scaleType) {
  var scaleType = scaleType || 'full';
  
  this.canvas = new CanvasManager(canvasSelector, scaleType);
  this.stateManager = new StateManager();
  this.loop = new Loop(this.stateManager);
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
  this.loop.startLoop();
};

Game.prototype.stop = function () {
  this.loop.stopLoop();
};

// Private

Game.prototype._adEventListeners = function () {
  var game = this;
  this.canvas.on('reload', function () {
    game.stateManager.resizeCurrentState();
  });
};

module.exports = Game;