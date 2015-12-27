var State = require('./state.js');

var States = function () {
  this.currentState = null;
  this.states = {};
};

States.prototype.addState = function (stateId, stateObj) {
  this.states[stateId] = new State(stateId, stateObj);
};

States.prototype.loadState = function (stateId) {
  if (this.currentState) {
    this.currentState.destroy();
  }
  this.currentState = this.states[stateId];
  this.currentState.init();
};

States.prototype.updateCurrentState = function () {
  this.currentState.update();
};

States.prototype.resizeCurrentState = function () {
  this.currentState.resize();
};

module.exports = States;