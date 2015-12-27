(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./eventer.js":2,"./window_size_manager.js":3}],2:[function(require,module,exports){
/*
  Custom events object
  - Turns an object into one that can fire custome events: https://gist.github.com/stewartknapman/f49fa09a10bf545610cf
*/

var Eventer = function (caller) {
  caller._events = {};
  caller.on = this.on;
  caller.off = this.off;
  caller.trigger = this.trigger;
  this.caller = caller;
};

// this === caller not the Eventer object
Eventer.prototype.on = function (event, callback) {
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(callback);
  return this._events[event].length - 1;
};

Eventer.prototype.off = function (event, id) {
  if (event && id) {
    if (this._events[event][id]) this._events[event][id] = null;
  } else if (event) {
    if (this._events[event]) this._events[event] = null;
  } else {
    this._events = {};
  }
};

Eventer.prototype.trigger = function (event, args) {
  if (typeof args !== 'object') args = [args]; 
  for (var i in this._events[event]) {
    var e = this._events[event][i];
    if (this._events[event].hasOwnProperty(i) && typeof e === 'function') e.apply(this, args);
  }
};

module.exports = Eventer;
},{}],3:[function(require,module,exports){
var Eventer = require('./eventer.js');
var instance;

var WindowSizeManager = function () {
  if (instance) {
    return instance;
  }
  
	Object.defineProperty(this, 'mqSize', {
		get: function () {
      return window.getComputedStyle(document.body,':after')
      .getPropertyValue('content')
      .replace(/['"]/g, '');
		}
	});
  
  new Eventer(this);
  this._addEventListeners();
  
  instance = this;
};

// Private

WindowSizeManager.prototype._addEventListeners = function () {
  var _this = this;
  window.addEventListener('resize', function (event) {
    _this._onResize(event);
  });
  window.addEventListener('orientationchange', function (event) {
    _this._onResize(event);
  });
};

WindowSizeManager.prototype._onResize = function (event) {
  this.trigger('resize', [this.mqSize]);
};

module.exports = WindowSizeManager;
},{"./eventer.js":2}],4:[function(require,module,exports){
var CanvasManager = require('../../src/canvas_manager.js');
var canvas = new CanvasManager('#main', scaleType);

var draw_background = function (scale_size) {
  var limit = 1500;
  var step = 10 * scale_size;
  
  for (var i = 0; i < (limit/step); i++) {
    if (i%2 === 0) {
      canvas.context.fillStyle = '#eeeeee';
    } else {
      canvas.context.fillStyle = '#ffffff';
    }
    
    var size = limit - (step * i);
    var x = Math.round((canvas.width - size) / 2);
    var y = Math.round((canvas.height - size) / 2);
    
    canvas.context.fillRect(x, y, size, size);
  }
};

var draw_box = function (scale_size) {
  var width = 100 * scale_size;
  var height = 100 * scale_size;
  var x = Math.round((canvas.width - width) / 2);
  var y = Math.round((canvas.height - height) / 2);
  
  canvas.context.fillStyle = '#03b9e3';
  canvas.context.fillRect(x, y, width, height);
};

var draw = function () {
  var scale_size;
  if (scaleType === 'scale') {
    scale_size = 1;
  } else if (scaleType === 'full') {
    switch (canvas.windowMQSize) {
      case 'xs':
        scale_size = 0.5;
        break;
      case 'sm':
        scale_size = 1;
        break;
      case 'md':
        scale_size = 1.5;
        break;
      case 'lg':
        scale_size = 2;
        break;
      case 'xl':
        scale_size = 2.5;
        break;
      default:
        scale_size = 1;
    }
  }
  
  draw_background(scale_size);
  draw_box(scale_size);
};

canvas.on('resize', function () {
  draw();
});

window.onload = function () {
  draw();
};
},{"../../src/canvas_manager.js":1}]},{},[4]);
