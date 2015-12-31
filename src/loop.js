var instance;
var Loop = function (stateManager) {
  if (instance) {
    return instance;
  }
  
  this.stateManager = stateManager;
  this.currentLoop = null;
  this.isRunning = false;
  
  instance = this;
};

Loop.prototype.main = function () {
  var _this = this;
  this.currentLoop = window.requestAnimationFrame(function () { 
    _this.main();
  });
  this.stateManager.updateCurrentState();
};

Loop.prototype.startLoop = function () {
  // don't cause multiple loops by starting again if it's already running
  if (!this.isRunning) {
    this.isRunning = true;
    this.main();
  }
};

Loop.prototype.stopLoop = function () {
  window.cancelAnimationFrame(this.currentLoop);
  this.isRunning = false;
};

module.exports = Loop;