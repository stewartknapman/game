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
    walls.drawTile = function (tile, x, y) {
      state.drawWall(tile, x, y, tileWidth, tileHeight);
    };
    
    // Create a new object layer for the player character
    // place it in the center of the world
    state.player = state.world.newObjectLayer('bb8', state.world.width/2, state.world.height/2);
    state.player.V = 4;
    state.player.draw = function (x, y) {
      state.drawPlayer(x, y);
    };
    // set the camera to follow the player
    state.camera.follow(state.player);
    
    // Create a new target object
    state.target = state.world.newObjectLayer('target', state.player.x, state.player.y);
    // Target highlight: circle grows and fades
    // time is 0.5sec, but needs to grow from 0 to 20px in that time
    // hence the 0.666 and the /20
    state.target.visible = false;
    state.target.step = 0.666;
    state.target.stepCount = 0;
    state.target.draw = function (x, y) {
      state.drawTarget(x, y);
    };
    
    // Input: move player to clicked/touched center
    state.direction = false;
    document.addEventListener('click', function (event) {
      state.newTarget(event);
    });
    document.addEventListener('touchstart', function (event) {
      state.newTarget(event);
    });
  },
  
  newTarget: function (event) {
    var state = this;
    state.target.x = Math.round(state.camera.x + event.pageX);
    state.target.y = Math.round(state.camera.y + event.pageY);
    state.target.visible = true;
    state.target.stepCount = 0;
    setTimeout(function () {
      state.target.visible = false;
    }, 500);
  },
  
  update: function () {
    this.direction = false;
    
    // Move payer to target
    if (this.target.x !== this.player.x || this.target.y !== this.player.y) {
      var diffX = this.player.x - this.target.x;
      var diffY = this.player.y - this.target.y;      
      var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
      var diffY_pos = (diffY < 0)? diffY * -1 : diffY;
      
      this.move(diffX, diffY, diffX_pos, diffY_pos, this.player.V);
    }
  },
  
  move: function (diffX, diffY, diffX_pos, diffY_pos, velocity) {
    // move along the shortest axis until it's the same as the target
    // then move along the remaining axiss
    if (this.player.x === this.target.x || this.player.y === this.target.y) {
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
      this.direction = 'left';
    } else {
      this.player.x += velocity;
      this.direction = 'right';
    }
  },
  
  moveY: function (diffY, diffY_pos, velocity) {
    if (diffY_pos < velocity) velocity = diffY_pos;
    if (diffY > 0) {
      this.player.y -= velocity;
      this.direction = 'up';
    } else {
      this.player.y += velocity;
      this.direction = 'down';
    }
  },
  
  resize: function () {
    // we no longer need this because the camera centers the world on the player
    // but it is good to retain this for the method of keeping things relative to the view instead of the world
/*
    var widthRatio = this.canvas.width / this.canvas.previousWidth;
    var heightRatio = this.canvas.height / this.canvas.previousHeight;
    
    this.player.x = Math.round(this.player.x * widthRatio);
    this.player.y = Math.round(this.player.y * heightRatio);
    this.target.x = Math.round(this.target.x * widthRatio);
    this.target.y = Math.round(this.target.y * heightRatio);
*/
  },
  
  destroy: function () {
  },
  
  buildWallMap: function (numRows, numCols, randomWallFrequency) {
    var wallMap = [];
    var reserved = [
      { x: (numRows/2) - 1, y: (numCols/2) - 1 }, // 15,15
      { x: (numRows/2) - 1, y: numCols/2 },       // 15,16
      { x: numRows/2, y: (numCols/2) - 1 },       // 16,15
      { x: numRows/2, y: numCols/2 },             // 16,16
    ];
    
    for (var i = 0; i < numRows; i++) {
      for (var j = 0; j < numCols; j++) {
        var w = 0;
        if (i === 0 || i === numRows-1) {
          w = 1; // top & bottom edge
        } else if (j === 0 || j === numCols-1) {
          w = 1; // left & right edge
        } else if (this.isReserved(i, j, reserved)) {
          w = 0; // reserved for spawn point so dont build walls here
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
  
  isReserved: function (r, c, reserved) {
    var isReserved = false;
    for (var i = 0; i < reserved.length; i++) {
      var obj = reserved[i];
      if (obj.x === r && obj.y === c) {
        isReserved = true;
      }
    }
    return isReserved;
  },
  
  drawWall: function (tile, x, y, tileWidth, tileHeight) {
    this.canvas.context.fillStyle = '#ccc';
    if (tile === 2) this.canvas.context.fillStyle = '#03b9e3';
    this.canvas.context.fillRect(x, y, tileWidth, tileHeight);
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
  },
  
  drawTarget: function (x, y) {
    if (this.target.visible) {
      this.target.stepCount++;
      var o = (1-((this.target.step * this.target.stepCount)/20)).toFixed(2);
      o = Number(o);
      this.canvas.context.strokeStyle = 'rgba(3, 185, 227, '+o+')'; //'#03b9e3';
      this.canvas.context.lineWidth = 2;
      this.canvas.context.beginPath();
      this.canvas.context.arc(x, y, (this.target.step * this.target.stepCount), 0, 180);
      this.canvas.context.stroke();
      this.canvas.context.closePath();
      this.canvas.context.lineWidth = 1;
    }
  }
});

game.loadState('demo');
game.start();