/*
  TODO:
    get current breakpoint from css 
*/

var CanvasManager = function (canvas_selector, scale) {
  this.canvas = document.querySelector(canvas_selector);
  
  if (this.canvas.getContext) {  
    this.context = this.canvas.getContext('2d');
    this.on_resize = function () {};
    this.scale = scale;
    
    this._get_size();
    this._add_event_listeners();
  }
};

CanvasManager.prototype.resize = function (e) {
  this._get_size();
  this.on_resize.apply(this);
};

// Private

CanvasManager.prototype._add_event_listeners = function () {
  var _this = this;
  window.addEventListener('resize', function (e) {
    _this.resize(e);
  });
  window.addEventListener('orientationchange', function (e) {
    _this.resize(e);
  });
};

CanvasManager.prototype._get_size = function () {
  if (this.scale) {
    // Scale the canvas down so that it fits the window but keeps it's proportions
    // Scaleing is done with css max-width & max-height
    if (this.canvas.width !== this.width) this.width = this.canvas.width = this.canvas.width;
    if (this.canvas.height !== this.height) this.height = this.canvas.height = this.canvas.height;
  } else {
    // Resize the canvas to fill the window
    if (window.innerWidth !== this.width) this.width = this.canvas.width = window.innerWidth;
    if (window.innerHeight !== this.height) this.height = this.canvas.height = window.innerHeight;
  }
};

module.exports = CanvasManager;