var CanvasManager = require('./canvas_manager.js');

var Game = function (canvas_selector) {
  this.canvas = new CanvasManager(canvas_selector);
};

module.exports = Game;