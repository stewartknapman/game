(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var CanvasManager = require('../../src/canvas_manager.js');
var canvas = new CanvasManager('#main', scale);

var draw_background = function () {
  canvas.context.fillStyle = '#eaeaea';
  
  var limit = 1500;
  var step = 10;
  
  for (var i = 0; i < limit; i++) {
    if (i%2 === 0) {
      canvas.context.fillStyle = '#eeeeee';
    } else {
      canvas.context.fillStyle = '#ffffff';
    }
    
    var size = limit - (step * i);
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    
    canvas.context.fillRect(centerX, centerY, size, size);
  }
};

var draw_box = function (scale) {
  scale = scale || 1;

  var width = 100 * scale;
  var height = 100 * scale;
  var x = Math.round((canvas.width - width) / 2);
  var y = Math.round((canvas.height - height) / 2);
  
  canvas.context.fillStyle = '#03b9e3';
  canvas.context.fillRect(x, y, width, height);
};

var draw = function () {
  draw_background();
  draw_box();
};

canvas.on_resize = function () {
  draw();
};

window.onload = function () {
  draw();
};
},{"../../src/canvas_manager.js":1}]},{},[2]);
