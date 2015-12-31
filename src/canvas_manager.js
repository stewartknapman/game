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

CanvasManager.prototype.clear = function () {
  // clears the canavs so that it is ready to be redrawn
  // TODO: have dirty areas marked for clearing to be more effciant,
  //  rather than clearing the whole thing?
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
  this.windowMQSize = this.window.mqSize;
};

CanvasManager.prototype._setCanvasSize = function () {
  this.devicePixelRatio = (window.devicePixelRatio > 1)? window.devicePixelRatio : 1;
  
  if (this.scaleType === 'scale') {
    this._setCanvasSizeToScale();
    
  } else if (this.scaleType === 'full') {
    this._setCanvasSizeToFull();
  }
  
  this.width = this.canvas.width / this.devicePixelRatio;
  this.height = this.canvas.height / this.devicePixelRatio;
  this.context.scale(this.devicePixelRatio, this.devicePixelRatio);
};

CanvasManager.prototype._setCanvasSizeToScale = function () {
  // scale canvas for retina and high pixel devices
  // if scaling only do it the first time
  if (this.width === undefined && this.height === undefined && this.devicePixelRatio > 1) {
    this.canvas.width = this.canvas.width * this.devicePixelRatio;
    this.canvas.height = this.canvas.height * this.devicePixelRatio;
  }
  
  // Scale the canvas down so that it fits the window but keeps it's proportions
  // Scaleing is done with css max-width & max-height
  this.previousWidth = this.width || this.canvas.width;
  this.previousHeight = this.height || this.canvas.height;
  this.canvas.width = this.canvas.width;
  this.canvas.height = this.canvas.height;
};

CanvasManager.prototype._setCanvasSizeToFull = function () {
  // Resize the canvas to fill the window
  this.previousWidth = this.width || window.innerWidth;
  this.previousHeight = this.height || window.innerHeight;
  this.canvas.width = window.innerWidth * this.devicePixelRatio;
  this.canvas.height = window.innerHeight * this.devicePixelRatio;
};

module.exports = CanvasManager;