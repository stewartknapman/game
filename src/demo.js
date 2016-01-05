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
    
    // Create a new object layer for the player character
    state.player = state.world.newObjectLayer('bb8');
    state.player.V = 5;
    state.player.draw = function (x, y) {
      state.drawPlayer(x, y);
    };
    
    state.targetX = state.player.x;
    state.targetY = state.player.y;
    
    
    // Input: move camera
    // BUG: clicking starts loop again after it has been stopped
    document.addEventListener('click', function (event) {
      state.targetX = Math.round(event.x);
      state.targetY = Math.round(event.y);
      
      
      
/*
      // this is a bit wrong, but it proves the camera can move for the most part.
      var diffX = (state.camera.width / 2) - event.x;
      var diffY = (state.camera.height / 2) - event.y;
      var x = state.camera.x - diffX;
      var y = state.camera.x - diffY;
      
      state.camera.moveTo(x, y);
*/
    });
  },
  
  update: function () {
    if (this.targetX !== this.player.x || this.targetY !== this.player.y) {
      var diffX = this.player.x - this.targetX;
      var diffY = this.player.y - this.targetY;      
      var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
      var diffY_pos = (diffY < 0)? diffY * -1 : diffY;
      
      this.move(diffX, diffY, diffX_pos, diffY_pos, this.player.V);
    }
  },
  
  move: function (diffX, diffY, diffX_pos, diffY_pos, velocity) {
    // move along the shortest axis until it's the same as the target
    // then move along the remaining axis
    
    if (this.player.x === this.targetX || this.player.y === this.targetY) {
      if (diffX_pos > diffY_pos) {
        this.moveX(diffX, diffX_pos, velocity);
      } else {
        this.moveY(diffY, diffY_pos, velocity);
      }
    } else {
      if (diffX_pos < diffY_pos) {
        this.moveX(diffX, diffX_pos, velocity);
      } else {
        this.moveY(diffY, diffY_pos, velocity);
      }
    }
  },
  
  moveX: function (diffX, diffX_pos, velocity) {
    if (diffX_pos < velocity) velocity = diffX_pos;
    if (diffX > 0) {
      this.player.x -= velocity;
    } else {
      this.player.x += velocity;
    }
  },
  
  moveY: function (diffY, diffY_pos, velocity) {
    if (diffY_pos < velocity) velocity = diffY_pos;
    if (diffY > 0) {
      this.player.y -= velocity;
    } else {
      this.player.y += velocity;
    }
  },
  
  resize: function () {
    var widthRatio = this.canvas.width / this.canvas.previousWidth;
    var heightRatio = this.canvas.height / this.canvas.previousHeight;
    
    this.player.x = Math.round(this.player.x * widthRatio);
    this.player.y = Math.round(this.player.y * heightRatio);
    this.targetX = Math.round(this.targetX * widthRatio);
    this.targetY = Math.round(this.targetY * heightRatio);
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