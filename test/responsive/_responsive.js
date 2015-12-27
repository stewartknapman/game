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