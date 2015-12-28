var Game = require('../../../src/game.js');
var game = new Game('#main');
window.game = game;

game.newState('demo', {
  init: function () {
    this.travelMethod = 'longestLine';
    this.playerV = 5;
    this.playerX = Math.round(game.canvas.width / 2);
    this.playerY = Math.round(game.canvas.height / 2);
    this.targetX = this.playerX;
    this.targetY = this.playerY;
    
    var _this = this;
    document.addEventListener('click', function (event) {
      _this.targetX = Math.round(event.x);
      _this.targetY = Math.round(event.y);
    });
  },
  
  update: function () {
    if (this.targetX !== this.playerX || this.targetY !== this.playerY) {

      var diffX = this.playerX - this.targetX;
      var diffY = this.playerY - this.targetY;      
      var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
      var diffY_pos = (diffY < 0)? diffY * -1 : diffY;
      var velocity = this.playerV;
      
      switch (this.travelMethod) {
        case 'longestLine':
          this.longestLine(diffX, diffY, diffX_pos, diffY_pos, velocity);
          break;
        default:
          this.shortestLine(diffX, diffY, diffX_pos, diffY_pos, velocity);
      }
    }
  },
  
  longestLine: function (diffX, diffY, diffX_pos, diffY_pos, velocity) {
    if (this.playerX === this.targetX || this.playerY === this.targetY) {
      this.shortestLine(diffX, diffY, diffX_pos, diffY_pos, velocity);
    } else {
      if (diffX_pos < diffY_pos) {
        this.moveX(diffX, diffX_pos, velocity);
      } else {
        this.moveY(diffY, diffY_pos, velocity);
      }
    }
  },
  
  shortestLine: function (diffX, diffY, diffX_pos, diffY_pos, velocity) {
    if (diffX_pos > diffY_pos) {
      this.moveX(diffX, diffX_pos, velocity);
    } else {
      this.moveY(diffY, diffY_pos, velocity);
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
    var widthRatio = game.canvas.width / game.canvas.previousWidth;
    var heightRatio = game.canvas.height / game.canvas.previousHeight;
    
    this.playerX = Math.round(this.playerX * widthRatio);
    this.playerY = Math.round(this.playerY * heightRatio);
    this.targetX = Math.round(this.targetX * widthRatio);
    this.targetY = Math.round(this.targetY * heightRatio);
  },
  
  render: function () { // Render is called after Init, Update & Resize
    this.drawPlayer();
  },
  
  drawPlayer: function () {
    game.canvas.context.fillStyle = '#eee';
    game.canvas.context.strokeStyle = '#ccc solid 1px';
    game.canvas.context.arc(this.playerX, this.playerY, 10, 0, 360);
    game.canvas.context.fill();
    game.canvas.context.stroke();
  }
});

game.loadState('demo');
// game.start();