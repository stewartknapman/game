var Game = require('../../src/game.js');
var game = new Game('#main');
window.game = game;

game.newState('demo', {
  init: function () {
    
    /*
      We have acces to the canvas, camera & world
      The World has layers, which can either be a map or an object
    */
    
    var state = this;
    var numRows = 32,
      numCols = 32,
      tileWidth = 64,
      tileHeight = 64,
      randomWallFrequency = 10;
      
    // if the worlds size is bigger than the canvas then we need to set it.
    state.world.setSize(tileWidth * numRows, tileHeight * numCols);
    
    // create a new map layer
    // randomly generate a tile map
    var wallMap = state.buildWallMap(numRows, numCols, randomWallFrequency);
    var walls = state.world.newMapLayer('walls', numRows, numCols, tileWidth, tileHeight, wallMap);
    // override layerMaps drawTile method so we have something to draw as we are not using sprites
    
    walls.drawTile = function (tile, x, y, c, r) {
      this.canvas.context.fillStyle = '#ccc';
      this.canvas.context.fillRect(x, y, tileWidth, tileHeight);
      
      this.canvas.context.fillStyle = '#333';
      this.canvas.context.fillText(c+':'+r, x+10, y+20);
    };
    
    var player = state.world.newObjectLayer('bb8');
    player.draw = function (x, y) {
      state.drawPlayer(x, y);
    };
    
    // Input: move camera
    // BUG: clicking starts loop again after it has been stopped
    document.addEventListener('click', function (event) {
      // this is a bit wrong, but it proves the camera can move for the most part.
      var diffX = (state.camera.width / 2) - event.x;
      var diffY = (state.camera.height / 2) - event.y;
      var x = state.camera.x - diffX;
      var y = state.camera.x - diffY;
      
      state.camera.moveTo(x, y);
    });
  },
  
  update: function () {
  },
  
  resize: function () {
  },
  
  destroy: function () {
  },
  
  buildWallMap: function (numRows, numCols, randomWallFrequency) {
    var wallMap = [];
    for (var i = 0; i < numRows; i++) {
      for (var j = 0; j < numCols; j++) {
        var w = 0;
        if (i === 0 || i === numRows-1) {
          w = 1; // top & bottom edge
        } else if (j === 0 || j === numCols-1) {
          w = 1; // left & right edge
        } else {
          var r = Math.round(Math.random() * 100);
          if (r % randomWallFrequency === 0) {
            w = 1;
          }
        }
        wallMap.push(w);
      }
    }
    return wallMap;
  },
  
  drawPlayer: function (x, y) {
        // body
    this.canvas.context.fillStyle = '#eee';
    this.canvas.context.strokeStyle = '#333';
    this.canvas.context.beginPath();
    this.canvas.context.arc(x, y, 20, 0, 180);
    this.canvas.context.fill();
    this.canvas.context.stroke();
    
    // orange dot
    this.canvas.context.fillStyle = '#ca601e';
    this.canvas.context.strokeStyle = '#ca601e';
    this.canvas.context.beginPath();
    this.canvas.context.arc(x, y, 12, 0, 180);
    this.canvas.context.fill();
    this.canvas.context.stroke();
    
    // silver dot
    this.canvas.context.fillStyle = '#ddd';
    this.canvas.context.beginPath();
    this.canvas.context.arc(x, y, 8, 0, 180);
    this.canvas.context.fill();
    
    // head
    this.canvas.context.fillStyle = '#eee';
    this.canvas.context.strokeStyle = '#333';
    this.canvas.context.beginPath();
    this.canvas.context.arc(x, y - 22, 10, (Math.PI/180)*150, (Math.PI/180)*30);
    this.canvas.context.arc(x, y - 42, 26, (Math.PI/180)*71, (Math.PI/180)*109);
    this.canvas.context.fill();
    this.canvas.context.stroke();
    
    // eyes
    this.canvas.context.fillStyle = '#333';
    this.canvas.context.strokeStyle = '#333';
    this.canvas.context.beginPath();
    this.canvas.context.arc(x, y - 25, 3, 0, 180);
    this.canvas.context.fill();
    this.canvas.context.stroke();
    
    this.canvas.context.fillStyle = '#333';
    this.canvas.context.strokeStyle = '#333';
    this.canvas.context.beginPath();
    this.canvas.context.arc(x + 5, y - 21, 1, 0, 180);
    this.canvas.context.fill();
    this.canvas.context.stroke();
    
    // antenia
    this.canvas.context.fillStyle = '#333';
    this.canvas.context.strokeStyle = '#333';
    this.canvas.context.beginPath();
    this.canvas.context.moveTo(x, y - 30);
    this.canvas.context.lineTo(x, y - 40);
    this.canvas.context.stroke();
    this.canvas.context.closePath();
  }
});

game.loadState('demo');
game.start();