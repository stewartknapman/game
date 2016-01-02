var State = require('./state.js');

var States = function () {
  this.states = {};
  this.currentState = null;
};

States.prototype.addState = function (stateId, stateObj, canvas) {
  this.states[stateId] = new State(stateId, stateObj, canvas);
};

States.prototype.loadState = function (stateId) {
  if (this.currentState) {
    this.currentState.destroy();
  }
  
  this.currentState = this.states[stateId];
  this.currentState.init();
  this.currentState.render();
};

States.prototype.updateCurrentState = function () {
  this.currentState.update();
  this.currentState.render();
};

States.prototype.resizeCurrentState = function () {
  this.currentState.resize();
  this.currentState.render();
};

module.exports = States;