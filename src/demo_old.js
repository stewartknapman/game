/*
  TODO:
    - collision detection
    - make bb-8's orange circles better
*/

var Game = require('../../src/game.js');
var game = new Game('#main');
window.game = game;

game.newState('demo', {
  init: function () {
    
    // player
    this.playerV = 5;
    this.playerX = Math.round(canvas.width / 2);
    this.playerY = Math.round(canvas.height / 2);
    this.targetX = this.playerX;
    this.targetY = this.playerY;
    
    // world
    this.gridSize = 60;
    this.worldSize = 2100;
    this.wallFrequency = 10;
    this.walls = this.buildWalls();
    
    // input
    var _this = this;
    document.addEventListener('click', function (event) {
      _this.targetX = Math.round(event.x);
      _this.targetY = Math.round(event.y);
      
      // don't start the game loop until we need it
      if (!game.isRunning) {
        game.start();
      }
    });
  },
  
  update: function () {
    if (this.targetX !== this.playerX || this.targetY !== this.playerY) {
      var diffX = this.playerX - this.targetX;
      var diffY = this.playerY - this.targetY;      
      var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
      var diffY_pos = (diffY < 0)? diffY * -1 : diffY;
      var velocity = this.playerV;
      
      this.move(diffX, diffY, diffX_pos, diffY_pos, velocity);
    }
  },
  
  move: function (diffX, diffY, diffX_pos, diffY_pos, velocity) {
    // move along the shortest axis until it's the same as the target
    // then move along the remaining axis
    
    if (this.playerX === this.targetX || this.playerY === this.targetY) {
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
      this.playerX -= velocity;
    } else {
      this.playerX += velocity;
    }
  },
  
  moveY: function (diffY, diffY_pos, velocity) {
    if (diffY_pos < velocity) velocity = diffY_pos;
    if (diffY > 0) {
      this.playerY -= velocity;
    } else {
      this.playerY += velocity;
    }
  },
  
  destroy: function () {
    
  },
  
  resize: function () {
    var widthRatio = canvas.width / canvas.previousWidth;
    var heightRatio = canvas.height / canvas.previousHeight;
    
    this.playerX = Math.round(this.playerX * widthRatio);
    this.playerY = Math.round(this.playerY * heightRatio);
    this.targetX = Math.round(this.targetX * widthRatio);
    this.targetY = Math.round(this.targetY * heightRatio);
  },
  
  render: function () { // Render is called after Init, Update & Resize
    this.drawWalls();
    this.drawPlayer();
  },
  
  drawPlayer: function () {
    // body
    canvas.context.fillStyle = '#eee';
    canvas.context.strokeStyle = '#333';
    canvas.context.beginPath();
    canvas.context.arc(this.playerX, this.playerY, 20, 0, 180);
    canvas.context.fill();
    canvas.context.stroke();
    
    // orange dot
    canvas.context.fillStyle = '#ca601e';
    canvas.context.strokeStyle = '#ca601e';
    canvas.context.beginPath();
    canvas.context.arc(this.playerX, this.playerY, 12, 0, 180);
    canvas.context.fill();
    canvas.context.stroke();
    
    // silver dot
    canvas.context.fillStyle = '#ddd';
    canvas.context.beginPath();
    canvas.context.arc(this.playerX, this.playerY, 8, 0, 180);
    canvas.context.fill();
    
    // head
    canvas.context.fillStyle = '#eee';
    canvas.context.strokeStyle = '#333';
    canvas.context.beginPath();
    canvas.context.arc(this.playerX, this.playerY - 22, 10, (Math.PI/180)*150, (Math.PI/180)*30);
    canvas.context.arc(this.playerX, this.playerY - 42, 26, (Math.PI/180)*71, (Math.PI/180)*109);
    canvas.context.fill();
    canvas.context.stroke();
    
    // eyes
    canvas.context.fillStyle = '#333';
    canvas.context.strokeStyle = '#333';
    canvas.context.beginPath();
    canvas.context.arc(this.playerX, this.playerY - 25, 3, 0, 180);
    canvas.context.fill();
    canvas.context.stroke();
    
    canvas.context.fillStyle = '#333';
    canvas.context.strokeStyle = '#333';
    canvas.context.beginPath();
    canvas.context.arc(this.playerX + 5, this.playerY - 21, 1, 0, 180);
    canvas.context.fill();
    canvas.context.stroke();
    
    // antenia
    canvas.context.fillStyle = '#333';
    canvas.context.strokeStyle = '#333';
    canvas.context.beginPath();
    canvas.context.moveTo(this.playerX, this.playerY - 30);
    canvas.context.lineTo(this.playerX, this.playerY - 40);
    canvas.context.stroke();
    canvas.context.closePath();
  },
  
  buildWalls: function () {
    var gridCount = this.worldSize / this.gridSize;
    var wallMap = [];
    
    for (var i = 0; i < gridCount; i++) {
      var row = [];
      for (var j = 0; j < gridCount; j++) {
        var w = 0;
        if (i === 0 || i === gridCount-1) {
          w = 1; // top & bottom edge
        } else if (j === 0 || j === gridCount-1) {
          w = 1; // left & right edge
        } else {
          var r = Math.round(Math.random() * 100);
          if (r % this.wallFrequency === 0) {
            w = 1;
          }
        }
        row.push(w);
      }
      wallMap.push(row);
    }
    
    return wallMap;
  },
  
  drawWalls: function () {
    for (var i = 0; i < this.walls.length; i++) {
      var row = this.walls[i];
      for (var j = 0; j < row.length; j++) {
        var cell = row[j];
        if (cell == 1) {
          var x = this.gridSize * j;
          var y = this.gridSize * i;
          this.drawWall(x, y);
        }
      }
    }
  },
  
  drawWall: function (x, y) {
    canvas.context.fillStyle = '#ccc';
    canvas.context.fillRect(x, y, this.gridSize, this.gridSize);
  }
});

game.loadState('demo');
// game.start();