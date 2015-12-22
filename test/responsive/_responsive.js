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