var Eventer = require('./eventer.js');
var WindowSizeManager = require('./window_size_manager.js');

var CanvasManager = function (canvasSelector, scaleType) {
  new Eventer(this);
  this.canvas = document.querySelector(canvasSelector);
  
  if (this.canvas.getContext) {
    this.window = new WindowSizeManager();
    this.context = this.canvas.getContext('2d');
    this.scaleType = scaleType || 'full';
  
    this._setSizeData();    
    this._addEventListeners();
  }
};

// Private

CanvasManager.prototype._addEventListeners = function () {
  var _this = this;
  this.window.on('resize', function() {
    _this._setSizeData();
    _this.trigger('resize');
  });
};

CanvasManager.prototype._setSizeData = function () {
  // set the current width and height of the canvas
  this._setCanvasSize();
  
  // set the orientation of the canavs and the window
  this.canvasOrientation = (this.width > this.height)? 'landscape' : 'portrait';
  this.windowOrientation = (window.innerWidth > window.innerHeight)? 'landscape' : 'portrait';
  
  // Set the current media query size of the window
  if (this.window.mqSize !== this.windowMQSize) this.windowMQSize = this.window.mqSize;
};

CanvasManager.prototype._setCanvasSize = function () {
  if (this.scaleType === 'scale') {
    // Scale the canvas down so that it fits the window but keeps it's proportions
    // Scaleing is done with css max-width & max-height
    if (this.canvas.width !== this.width) this.width = this.canvas.width = this.canvas.width;
    if (this.canvas.height !== this.height) this.height = this.canvas.height = this.canvas.height;
  } else if (this.scaleType === 'full') {
    // Resize the canvas to fill the window
    if (window.innerWidth !== this.width) this.width = this.canvas.width = window.innerWidth;
    if (window.innerHeight !== this.height) this.height = this.canvas.height = window.innerHeight;
  }
};

module.exports = CanvasManager;