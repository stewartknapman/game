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
//       state.canvas.context.fillStyle = '#333';
//       state.canvas.context.fillText(r+':'+c, x+10, y+20);
    };
    
    // Create a new object layer for the player character
    // place it in the center of the world
    state.player = state.world.newObjectLayer('bb8', state.world.width/2, state.world.height/2, tileWidth, tileHeight);
    state.player.V = 4;
    state.player.draw = function (x, y) {
//       state.canvas.context.fillStyle = '#eee';
//       state.canvas.context.fillRect(x - (42/2), y - (56/2), 42, 56);      
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
    state.target.currentTarget = false;
    document.addEventListener('click', function (event) {
      state.newTarget(event);
    });
    document.addEventListener('touchstart', function (event) {
      state.newTarget(event);
    });
  },
  
  newTarget: function (event) {
    // Set a new target x & y so that we can give feedback
    state.target.x = Math.round(state.camera.x + event.pageX);
    state.target.y = Math.round(state.camera.y + event.pageY);
    
    // check if the new target collides with a wall
    var target = {
      x: state.target.x - 32, // offset x by half a title
      y: state.target.y - 32, // offset y by half a title
      width: 32,
      height: 32
    };
    if (state.world.collides(target, state.walls)) {
      // can't set a traget in a collision zone
      state.target.currentTarget = false;
    } else {
      // target is attainable so create a direction object
      state.target.currentTarget = state.setNewTarget();
      console.log(state.target.currentTarget);
    }
    
    // Show then hide the targets feedback ripple
    state.target.visible = true;
    state.target.stepCount = 0;
    setTimeout(function () {
      state.target.visible = false;
    }, 500);
  },
  
  setNewTarget: function () {
    // get the difference between the player and the target
    var diffX = state.player.x - state.target.x;
    var diffY = state.player.y - state.target.y;    
    // make diffs positive for easier checking and calcs  
    var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
    var diffY_pos = (diffY < 0)? diffY * -1 : diffY;
    
    return {
      currentDirection: 0,
      diffX: diffX,
      diffX_pos: diffX_pos,
      diffY: diffY,
      diffY_pos: diffY_pos,
      direction: state.getDirection(diffX, diffY, diffX_pos, diffY_pos)
    };
  },
  
  getDirection: function (diffX, diffY, diffX_pos, diffY_pos) {
    var direction = [];
    var goX = function () {
      if (diffX > 0) {
        direction.push('left');
      } else {
        direction.push('right');
      }
    };
    var goY = function () {
      if (diffY > 0) {
        direction.push('up');
      } else {
        direction.push('down');
      }
    };
    var switchDir = function (dir) {
      switch (dir) {
        case 'left':
          direction.push('right');
          break;
        case 'right':
          direction.push('left');
          break;
        case 'up':
          direction.push('down');
          break;
        case 'down':
          direction.push('up');
          break;
      }
    };
    
    // first choice: longest direction towards
    if (diffX_pos > diffY_pos) {
      goX();
    } else {
      goY();
    }
    
    // second choice: shortest direction towards
    if (diffX_pos < diffY_pos) {
      goX();
    } else {
      goY();
    }
    
    // third choice: longest direction away
    // opposite of first
    switchDir(direction[0]);
    
    // fourth choice: shortest direction away
    // opposite of second
    switchDir(direction[1]);
    
    return direction;
  },
  
  update: function () {
    // if we have a target that is different to our players x & y
    // and we can reach it
    // move the player towards target

    // Work out the current direction and hold it. (up/down/left/right)
    // if we can't make the next step or we are at 0 on our current axis
    // then change the direction
    
    // Object dosn't change until new target
    // Changing direction preference: e.g. target: top, right
    // - longest distance(axis) towards target e.g. right (until hit or stop)
    // - shortest distance(axis) towards target e.g. up (until hit or stop)
    // - longest distance(axis) away from target e.g. left (try above step first or until hit)
    // - shortest distance(axis) away from target e.g. down (try above step first or until hit)
    // Preferece stack is two-way: e.g. go in order of 1,2,3,4,3,2,1














//     if (state.target.attainable && (state.target.x !== state.player.x || state.target.y !== state.player.y)) {

/*
      // get the difference between the player and the target
      var diffX = state.player.x - state.target.x;
      var diffY = state.player.y - state.target.y;    
      // make diffs positive for easier calcs  
      var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
      var diffY_pos = (diffY < 0)? diffY * -1 : diffY;
      
      // make sure we have a heading, if we don't then get one
      state.currentDirection = state.currentDirection || state.getDirection(diffX, diffY, diffX_pos, diffY_pos);
      
      // actually move
      var velocity = state.player.V;
      switch (state.currentDirection) {
        case 'up':
          if (diffY_pos < velocity) velocity = diffY_pos;
          state.player.y -= velocity;
          break;
        case 'down':
          if (diffY_pos < velocity) velocity = diffY_pos;
          state.player.y += velocity;
          break;
        case 'left':
          if (diffX_pos < velocity) velocity = diffX_pos;
          state.player.x -= velocity;
          break;
        case 'right':
          if (diffX_pos < velocity) velocity = diffX_pos;
          state.player.x += velocity;
          break;
      }
      
      // check if we have a collision for next time round
      // if we do then change direction
      state.checkPath(velocity);
      state.lastDirection = state.currentDirection;
*/
//     } else {
//       state.currentDirection = false;
//     }
    
    
    
    
    
    
    
    
/*
    if (state.target.attainable && (state.target.x !== state.player.x || state.target.y !== state.player.y)) {
      var diffX = state.player.x - state.target.x;
      var diffY = state.player.y - state.target.y;    
      // make diffs positive for easier calcs  
      var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
      var diffY_pos = (diffY < 0)? diffY * -1 : diffY;

      console.log('---');

      // move along the shortest axis until it's the same as the target
      // then move along the remaining axiss
      if (state.player.x === state.target.x || state.player.y === state.target.y) {
        if (diffX_pos > diffY_pos) {
          state.moveX(diffX, diffX_pos, state.player.V);
        } else {
          state.moveY(diffY, diffY_pos, state.player.V);
        }
      } else {
        if (diffX_pos < diffY_pos) {
          state.moveX(diffX, diffX_pos, state.player.V);
        } else {
          state.moveY(diffY, diffY_pos, state.player.V);
        }
      }
    }
*/
  },
  
/*
  getDirection: function (diffX, diffY, diffX_pos, diffY_pos) {
    var direction;
    // move along the shortest axis until it's the same as the target
    // then move along the remaining axiss
    if (state.player.x === state.target.x || state.player.y === state.target.y) {
      if (diffX_pos > diffY_pos) {
        if (diffX > 0) {
          direction = 'left';
        } else {
          direction = 'right';
        }
      } else {
        if (diffY > 0) {
          direction = 'up';
        } else {
          direction = 'down';
        }
      }
    } else {
      if (diffX_pos < diffY_pos) {
        if (diffX > 0) {
          direction = 'left';
        } else {
          direction = 'right';
        }
      } else {
        if (diffY > 0) {
          direction = 'up';
        } else {
          direction = 'down';
        }
      }
    }
    return direction;
  },
*/
  
/*
  checkPath: function (velocity) {
    var target = {
      width: 32,
      height: 32
    };
    switch (state.lastDirection) {
      case 'up':
        target.x = state.player.x - 32;
        target.y = (state.player.y - velocity) - 32;
        if (state.world.collides(target, state.walls)) {
          state.currentDirection = false;
        }
        break;
      case 'down':
        target.x = state.player.x - 32;
        target.y = (state.player.y + velocity) - 32;
        if (state.world.collides(target, state.walls)) {
          state.currentDirection = false;
        }
        break;
      case 'left':
        target.x = (state.player.x - velocity) - 32;
        target.y = state.player.y - 32;
        if (state.world.collides(target, state.walls)) {
          state.currentDirection = false;
        }
        break;
      case 'right':
        target.x = (state.player.x + velocity) - 32;
        target.y = state.player.y - 32;
        if (state.world.collides(target, state.walls)) {
          state.currentDirection = false;
        }
        break;
    }
  },
*/
  
  
  
  
  
  
  
/*
  moveX: function (diffX, diffX_pos, velocity) {
    if (diffX_pos < velocity) velocity = diffX_pos;
    if (diffX > 0) {
      state.move('left', velocity);
    } else {
      state.move('right', velocity);
    }
  },
  
  moveY: function (diffY, diffY_pos, velocity) {
    if (diffY_pos < velocity) velocity = diffY_pos;
    if (diffY > 0) {
      state.move('up', velocity);
    } else {
      state.move('down', velocity);
    }
  },
  
  move: function (dir, velocity) {
    var target = {
      width: 32, //42,
      height: 32 //50
    };
    state.direction = dir;
    console.log(dir);
    switch (dir) {
      case 'up':
        if (state.lastDirection == 'down') {
          console.log('last is down');
          state.move('down', velocity);
        }
        target.x = state.player.x - 32; // offset x by half a title
        target.y = (state.player.y - velocity) - 32; // offset y by half a title
        if (!state.world.collides(target, state.walls)) {
          state.player.y -= velocity;
        } else {
          target.x = (state.player.x + velocity) - 32; // offset x by half a title
          target.y = state.player.y - 32; // offset y by half a title
          if (!state.world.collides(target, state.walls)) {
            state.move('right', velocity);
          } else {
            state.move('left', velocity);
          }
        }
        break;
        
      case 'down':
        if (state.lastDirection == 'up') {
          console.log('last is up');
          state.move('up', velocity);
        }
        target.x = state.player.x - 32; // offset x by half a title
        target.y = (state.player.y + velocity) - 32; // offset y by half a title
        if (!state.world.collides(target, state.walls)) {
          state.player.y += velocity;
        } else {
          target.x = (state.player.x - velocity) - 32; // offset x by half a title
          target.y = state.player.y - 32; // offset y by half a title
          if (!state.world.collides(target, state.walls)) {
            state.move('left', velocity);
          } else {
            state.move('right', velocity);
          }
        }
        break;
        
      case 'left':
        if (state.lastDirection == 'right') {
          console.log('last is right');
          state.move('right', velocity);
        }
        target.x = (state.player.x - velocity) - 32; // offset x by half a title
        target.y = state.player.y - 32; // offset y by half a title
        if (!state.world.collides(target, state.walls)) {
          state.player.x -= velocity;
        } else {
          target.x = state.player.x - 32; // offset x by half a title
          target.y = (state.player.y - velocity) - 32; // offset y by half a title
          if (!state.world.collides(target, state.walls)) {
            state.move('up', velocity);
          } else {
            state.move('down', velocity);
          }
        }
        break;
        
      case 'right':
        if (state.lastDirection == 'left') {
          console.log('last is left');
          state.move('left', velocity);
        }
        target.x = (state.player.x + velocity) - 32; // offset x by half a title
        target.y = state.player.y - 32; // offset y by half a title
        if (!state.world.collides(target, state.walls)) {
          state.player.x += velocity;
        } else {
          target.x = state.player.x - 32; // offset x by half a title
          target.y = (state.player.y + velocity) - 32; // offset y by half a title
          if (!state.world.collides(target, state.walls)) {
            state.move('down', velocity);
          } else {
            state.move('up', velocity);
          }
        }
        break;
    }
    state.lastDirection = dir;
  },
*/
  
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
      
      if (state.target.currentTarget) {
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