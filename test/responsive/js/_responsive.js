var CanvasManager = require('../../../src/canvas_manager.js');
var canvas = new CanvasManager('#main', scaleType);

var draw_background = function () {
  var limit = 2000;
  var step = 10;
  
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

var draw_circle = function (scale_size) {
  var radius = 50; // * scale_size;
  var x = Math.round(canvas.width / 2);
  var y = Math.round(canvas.height / 2);
  
  canvas.context.fillStyle = '#03b9e3';
  canvas.context.arc(x, y, radius, 0, 180);
  canvas.context.fill();
};

var scale = function () {
  var scale_size;
  if (scaleType === 'scale') {
    scale_size = 1;
  } else if (scaleType === 'full') {
    switch (canvas.windowMQSize) {
      case 'xs':
        scale_size = 1;
        break;
      case 'sm':
        scale_size = 1.25;
        break;
      case 'md':
        scale_size = 1.5;
        break;
      case 'lg':
        scale_size = 1.75;
        break;
      case 'xl':
        scale_size = 2;
        break;
      default:
        scale_size = 1;
    }
  }
  return scale_size;
};

var draw = function () {
  var scale_size = scale();
  
  draw_background();
  draw_circle(scale_size);
};

canvas.on('resize', function () {
  draw();
});

window.onload = function () {
  draw();
};