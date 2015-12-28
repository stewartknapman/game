var State = require('./state.js');

var States = function (canvas) {
  this.canvas = canvas;
  this.states = {};
  this.currentState = null;
};

States.prototype.addState = function (stateId, stateObj) {
  this.states[stateId] = new State(stateId, stateObj);
};

States.prototype.loadState = function (stateId) {
  if (this.currentState) {
    this.currentState.destroy();
    this.canvas.clear();
  }
  
  this.currentState = this.states[stateId];
  this.currentState.init();
  this.currentState.render();
};

States.prototype.updateCurrentState = function () {
  this.currentState.update();
  this.canvas.clear();
  this.currentState.render();
};

States.prototype.resizeCurrentState = function () {
  this.currentState.resize();
  this.canvas.clear();
  this.currentState.render();
};

module.exports = States;