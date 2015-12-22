(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var CanvasManager = require('../../src/canvas_manager.js');
var canvas_manager = new CanvasManager('#main');


},{"../../src/canvas_manager.js":1}]},{},[2]);
