var instance;
var Loop = function (stateManager) {
  if (instance) {
    return instance;
  }
  
  this.stateManager = stateManager;
  this.currentLoop = null;
  
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
  this.main();
};

Loop.prototype.stopLoop = function () {
  window.cancelAnimationFrame(this.currentLoop);
};

module.exports = Loop;