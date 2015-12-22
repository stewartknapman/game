/*
  TODO:
    event emitter (singleton?)
    get current breakpoint from css 
*/

var CanvasManager = function (canvas_selector) {
  this.canvas = document.querySelector(canvas_selector);
  
  this._add_event_listeners();
  
  console.log('CanvasManager', canvas_selector, this.canvas);
};

CanvasManager.prototype.resize = function (e) {
  console.log('resize', e);
};

// Private

CanvasManager.prototype._add_event_listeners = function () {
  window.addEventListener('resize', this.resize);
  window.addEventListener('orientationchange', this.resize);
};

module.exports = CanvasManager;