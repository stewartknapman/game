var Game = require('../../src/game.js');
var game = new Game('#main');
window.game = game;

var state;
game.newState('demo', {
  init: function () {
    
    /*
      We have acces to the canvas, camera & world
      The World has layers, which can either be a map or an object
    */
    
    state = this;
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
    state.walls = state.world.newMapLayer('walls', numRows, numCols, tileWidth, tileHeight, wallMap);
    // override layerMaps drawTile method so we have something to draw as we are not using sprites
    state.walls.drawTile = function (tile, x, y, r, c) {
      state.drawWall(tile, x, y, tileWidth, tileHeight);
      
      state.canvas.context.fillStyle = '#333';
      state.canvas.context.fillText(r+':'+c, x+10, y+20);
    };
    
    // Create a new object layer for the player character
    // place it in the center of the world
    state.player = state.world.newObjectLayer('bb8', state.world.width/2, state.world.height/2, tileWidth, tileHeight);
    state.player.V = 4;
    state.player.draw = function (x, y) {
      state.canvas.context.fillStyle = '#eee';
      state.canvas.context.fillRect(x - (42/2), y - (56/2), 42, 56);
      
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
    // if new target collides with wall then don't set the target
    // but still give feedback: red ripple
    
    state.target.x = Math.round(state.camera.x + event.pageX);
    state.target.y = Math.round(state.camera.y + event.pageY);
    
    var target = {
      x: state.target.x - (42/2),
      y: state.target.y - (50/2),
      width: 42,
      height: 50
    };
/*
    var target = {
      x: state.target.x - (64/2), //(42/2),
      y: state.target.y - (64/2), //(56/2),
      width: 64, //42,
      height: 64 //56
    };
*/
    
    if (!state.world.collides(target, state.walls)) {
      state.target.attainable = true;
    } else {
      state.target.attainable = false;
    }
    state.target.visible = true;
    state.target.stepCount = 0;
    setTimeout(function () {
      state.target.visible = false;
    }, 500);
  },
  
  update: function () {
    state.direction = false;
    
    // move payer towards target
    if (state.target.attainable && (state.target.x !== state.player.x || state.target.y !== state.player.y)) {
      var diffX = state.player.x - state.target.x;
      var diffY = state.player.y - state.target.y;      
      var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
      var diffY_pos = (diffY < 0)? diffY * -1 : diffY;
      
      // if !player.collides with wall
      state.move(diffX, diffY, diffX_pos, diffY_pos, state.player.V);
    }
  },
  
  move: function (diffX, diffY, diffX_pos, diffY_pos, velocity) {
    // move along the shortest axis until it's the same as the target
    // then move along the remaining axiss
    if (state.player.x === state.target.x || state.player.y === state.target.y) {
      if (diffX_pos > diffY_pos) {
        state.moveX(diffX, diffX_pos, velocity);
      } else {
        state.moveY(diffY, diffY_pos, velocity);
      }
    } else {
      if (diffX_pos < diffY_pos) {
        state.moveX(diffX, diffX_pos, velocity);
      } else {
        state.moveY(diffY, diffY_pos, velocity);
      }
    }
  },
  
  moveX: function (diffX, diffX_pos, velocity) {
    if (diffX_pos < velocity) velocity = diffX_pos;
    if (diffX > 0) {
      state.player.x -= velocity;
      state.direction = 'left';
    } else {
      state.player.x += velocity;
      state.direction = 'right';
    }
  },
  
  moveY: function (diffY, diffY_pos, velocity) {
    if (diffY_pos < velocity) velocity = diffY_pos;
    if (diffY > 0) {
      state.player.y -= velocity;
      state.direction = 'up';
    } else {
      state.player.y += velocity;
      state.direction = 'down';
    }
  },
  
  resize: function () {
    // we no longer need this because the camera centers the world on the player
    // but it is good to retain this for the method of keeping things relative to the view instead of the world
/*
    var widthRatio = state.canvas.width / state.canvas.previousWidth;
    var heightRatio = state.canvas.height / state.canvas.previousHeight;
    
    state.player.x = Math.round(state.player.x * widthRatio);
    state.player.y = Math.round(state.player.y * heightRatio);
    state.target.x = Math.round(state.target.x * widthRatio);
    state.target.y = Math.round(state.target.y * heightRatio);
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
        } else if (state.isReserved(i, j, reserved)) {
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
    state.canvas.context.fillStyle = '#ccc';
    if (tile === 2) state.canvas.context.fillStyle = '#03b9e3';
    state.canvas.context.fillRect(x, y, tileWidth, tileHeight);
  },
  
  drawPlayer: function (x, y) {
    // body
    state.canvas.context.fillStyle = '#eee';
    state.canvas.context.strokeStyle = '#333';
    state.canvas.context.beginPath();
    state.canvas.context.arc(x, y, 20, 0, 180);
    state.canvas.context.fill();
    state.canvas.context.stroke();
    
    // orange dot
    state.canvas.context.fillStyle = '#ca601e';
    state.canvas.context.strokeStyle = '#ca601e';
    state.canvas.context.beginPath();
    state.canvas.context.arc(x, y, 12, 0, 180);
    state.canvas.context.fill();
    state.canvas.context.stroke();
    
    // silver dot
    state.canvas.context.fillStyle = '#ddd';
    state.canvas.context.beginPath();
    state.canvas.context.arc(x, y, 8, 0, 180);
    state.canvas.context.fill();
    
    // head
    state.canvas.context.fillStyle = '#eee';
    state.canvas.context.strokeStyle = '#333';
    state.canvas.context.beginPath();
    state.canvas.context.arc(x, y - 22, 10, (Math.PI/180)*150, (Math.PI/180)*30);
    state.canvas.context.arc(x, y - 42, 26, (Math.PI/180)*71, (Math.PI/180)*109);
    state.canvas.context.fill();
    state.canvas.context.stroke();
    
    // eyes
    state.canvas.context.fillStyle = '#333';
    state.canvas.context.strokeStyle = '#333';
    state.canvas.context.beginPath();
    state.canvas.context.arc(x, y - 25, 3, 0, 180);
    state.canvas.context.fill();
    state.canvas.context.stroke();
    
    state.canvas.context.fillStyle = '#333';
    state.canvas.context.strokeStyle = '#333';
    state.canvas.context.beginPath();
    state.canvas.context.arc(x + 5, y - 21, 1, 0, 180);
    state.canvas.context.fill();
    state.canvas.context.stroke();
    
    // antenia
    state.canvas.context.fillStyle = '#333';
    state.canvas.context.strokeStyle = '#333';
    state.canvas.context.beginPath();
    state.canvas.context.moveTo(x, y - 30);
    state.canvas.context.lineTo(x, y - 40);
    state.canvas.context.stroke();
    state.canvas.context.closePath();
  },
  
  drawTarget: function (x, y) {
    if (state.target.visible) {
      state.target.stepCount++;
      var o = (1-((state.target.step * state.target.stepCount)/20)).toFixed(2);
      o = Number(o);
      
      if (state.target.attainable) {
        state.canvas.context.strokeStyle = 'rgba(3, 185, 227, '+o+')'; //'#03b9e3';
      } else {
        state.canvas.context.strokeStyle = 'rgba(243, 58, 58, '+o+')'; //'#f33a3a'; red
      }
      
      state.canvas.context.lineWidth = 2;
      state.canvas.context.beginPath();
      state.canvas.context.arc(x, y, (state.target.step * state.target.stepCount), 0, 180);
      state.canvas.context.stroke();
      state.canvas.context.closePath();
      state.canvas.context.lineWidth = 1;
    }
  }
});

game.loadState('demo');
game.start();