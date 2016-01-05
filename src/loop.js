var instance;
var Loop = function (canvas, stateManager) {
  if (instance) {
    return instance;
  }
  
  this.canvas = canvas;
  this.stateManager = stateManager;
  this.currentLoop = null;
  this.isRunning = false;
  this.blurWhileRunning = false;
  
  this._addEventListeners();
  
  instance = this;
};

Loop.prototype.main = function () {
  var _this = this;
  this.currentLoop = window.requestAnimationFrame(function () { 
    _this.main();
  });
  
  this.canvas.clear();
  this.stateManager.updateCurrentState();
};

Loop.prototype.startLoop = function () {
  // don't cause multiple loops by starting again if it's already running
  if (!this.isRunning) {
    this.isRunning = true;
    this.main();
  }
};

Loop.prototype.stopLoop = function (force) {
  var c = window.cancelAnimationFrame(this.currentLoop);
  this.isRunning = false;

  // Stopped is stopped, don't restart if blured
  // fixes issue when trying to stop from console and blur gets in first
  if (force) {
    this.blurWhileRunning = false;
  }
};

// Private

Loop.prototype._addEventListeners = function () {
  var _this = this;
  window.addEventListener('blur', function () {
    if (_this.isRunning) {
      _this.blurWhileRunning = true;
      _this.stopLoop();
    }
  });
  
  window.addEventListener('focus', function () {
    if (_this.blurWhileRunning) {
      _this.blurWhileRunning = false;
      _this.startLoop();
    }
  });
};

module.exports = Loop;