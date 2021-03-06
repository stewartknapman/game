(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    }
    
    // Show then hide the targets feedback ripple
    state.target.visible = true;
    state.target.stepCount = 0;
    setTimeout(function () {
      state.target.visible = false;
    }, 500);
  },
  
  setNewTarget: function () {
    var diffs = state.getDiffs();
    return {
      currentDirection: 0,
      diffs: diffs,
      direction: state.getDirectionStack(diffs)
    };
  },
  
  getDiffs: function () {
    // get the difference between the player and the target
    var diffX = state.player.x - state.target.x;
    var diffY = state.player.y - state.target.y;    
    // make diffs positive for easier checking and calcs  
    var diffX_pos = (diffX < 0)? diffX * -1 : diffX;
    var diffY_pos = (diffY < 0)? diffY * -1 : diffY;
    
    return {
      x: diffX,
      x_pos: diffX_pos,
      y: diffY,
      y_pos: diffY_pos
    }
  },
  
  getDirectionStack: function (diffs) {
    var direction = [];
    var goX = function () {
      if (diffs.x > 0) {
        direction.push('left');
      } else {
        direction.push('right');
      }
    };
    var goY = function () {
      if (diffs.y > 0) {
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
    if (diffs.x_pos > diffs.y_pos) {
      goX();
    } else {
      goY();
    }
    
    // second choice: shortest direction towards
    if (diffs.x_pos < diffs.y_pos) {
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





    // !!!!
    // can you move in any of these directions?
    // if so which one?
    // - check against hit or stop and find the first that can
    
    // now move
    
    // if dir is 3rd||4th choice
    // make curDir -1


    state.tick = state.tick || 0;
    if (state.target.currentTarget) {
      // if we have reached the target then stop
      if (state.target.x === state.player.x && state.target.y === state.player.y) {
        state.target.currentTarget = false;
        state.tick = 0;
      } else {
        state.tick++;
        // Get me that target
        state.target.currentTarget.diffs = state.getDiffs();
        var d = state.target.currentTarget.currentDirection;
        var direction = state.target.currentTarget.direction[d];
        
        
        console.log('-----');
//         console.log('direction', direction, d);
        
        // if we are on the targets axis
        // then change direction
        if (state.target.x === state.player.x) {
          if (direction === 'left' || direction === 'right') {
            d++;
          }
        } else if (state.target.y === state.player.y) {
          if (direction === 'up' || direction === 'down') {
            d++;
          }
        }
        
        // get the next posible direction
        state.directionCount = 0;
        d = state.getDirection(d);
//         console.log('updated direction', state.target.currentTarget.direction[d], d);
        if (d !== false) {
          state.target.currentTarget.currentDirection = d;
          direction = state.target.currentTarget.direction[d];
          
          var velocity = state.getVelocity(direction);
          switch (direction) {
            case 'up':
              state.player.y -= velocity;
              break;
            case 'down':
              state.player.y += velocity;
              break;
            case 'left':
              state.player.x -= velocity;
              break;
            case 'right':
              state.player.x += velocity;
              break;
          }
        
          // update direction for next tick if we are heading in the opposite way
          // 64 == 2 tiles
/*
          if (state.tick % 64 === 0) {
            if (d === 2) state.target.currentTarget.currentDirection = 0;
            if (d === 3) state.target.currentTarget.currentDirection = 1;
          }
*/
/*
          if (state.target.currentTarget.currentDirection > 1 &&
          state.target.currentTarget.currentDirection < state.target.currentTarget.direction.length &&
          state.tick % 64 === 0) {
            state.target.currentTarget.currentDirection--;
            console.log('step back', d, state.target.currentTarget.currentDirection);
          }
*/
          
          console.log(state.target.currentTarget);
          
        } else {
          // couldn't get a direction so we are stuck
          console.log('stuck');
          state.target.x = state.player.x;
          state.target.y = state.player.y;
          state.target.currentTarget = false;
        }
      }
    }
  },
  
  getVelocity: function (direction) {
    var velocity = state.player.V;
    // don't over shoot target
    if (direction === 'up' || direction === 'down') {
      if (state.target.currentTarget.diffs.y_pos < velocity) velocity = state.target.currentTarget.diffs.y_pos;
    } else {
      if (state.target.currentTarget.diffs.x_pos < velocity) velocity = state.target.currentTarget.diffs.x_pos;
    }
    return velocity;
  },
  
  getDirection: function (d) {
    state.directionCount++;
    if (state.directionCount < 6) { 
    
//       var preD = d;
      if (d < 0) d++;
      if (d >= state.target.currentTarget.direction.length) d--;
      
//       console.log('d', d);
      var direction = state.target.currentTarget.direction[d];
      var velocity = state.getVelocity(direction);
      var target = {
        width: 32,
        height: 32
      };
      
      switch (direction) {
        case 'up':
          target.x = state.player.x - 32;
          target.y = (state.player.y - velocity) - 32;
          break;
        case 'down':
          target.x = state.player.x - 32;
          target.y = (state.player.y + velocity) - 32;
          break;
        case 'left':
          target.x = (state.player.x - velocity) - 32;
          target.y = state.player.y - 32;
          break;
        case 'right':
          target.x = (state.player.x + velocity) - 32;
          target.y = state.player.y - 32;
          break;
      }
      
      if (state.world.collides(target, state.walls)) {
        // collision so try another direction
        
        console.log(state.target.currentTarget.currentDirection, d);
        
/*
        if (preD < d) {
          console.log('going down');
          d--;
        } else {
          console.log('going up');
          d++;
        }
*/
        d++;
        return state.getDirection(d);
      } else {
        // go this way
        return d;
      }
      
    } else {
      console.log('over count limit');
      return false;
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
},{"../../src/game.js":6}],2:[function(require,module,exports){
var Camera = function (canvas) {
  this.canvas = canvas;
  this.x = 0;
  this.y = 0;
  this.maxX = 0;
  this.maxY = 0;
  this.width = canvas.width;
  this.height = canvas.height;
  this.following = false;
  
  this._addEventListeners();
};

Camera.prototype.moveTo = function (x, y) {
  this.x = x;
  this.y = y;
  
  // clamp values so that they can not got outside the bounds of the world
  this.x = Math.max(0, Math.min(this.x, this.maxX));
  this.y = Math.max(0, Math.min(this.y, this.maxY));
};

Camera.prototype.follow = function (obj) {
  this.following = obj;
  this.following.screenX = 0;
  this.following.screenY = 0;
};

Camera.prototype.update = function () {
  if (this.following) {
    // assume followed sprite should be placed at the center of the screen
    // whenever possible
    this.following.screenX = this.width / 2;
    this.following.screenY = this.height / 2;
  
    // make the camera follow the sprite
    this.x = this.following.x - this.width / 2;
    this.y = this.following.y - this.height / 2;
    // clamp values
    this.x = Math.max(0, Math.min(this.x, this.maxX));
    this.y = Math.max(0, Math.min(this.y, this.maxY));
  
    // in map corners, the sprite cannot be placed in the center of the screen
    // and we have to change its screen coordinates
  
    // left and right sides
    if (this.following.x < this.width / 2 ||
      this.following.x > this.maxX + this.width / 2) {
      this.following.screenX = this.following.x - this.x;
    }
    // top and bottom sides
    if (this.following.y < this.height / 2 ||
      this.following.y > this.maxY + this.height / 2) {
      this.following.screenY = this.following.y - this.y;
    }
  }
};

Camera.prototype.updateWorldBounds = function (worldWidth, worldHeight) {
  // retain the worlds width and height so that we can reuse it if the screen is resized
  this.worldWidth = worldWidth || this.worldWidth;
  this.worldHeight = worldHeight || this.worldHeight;
  
  // if the cameras width and height are smaller than the worlds width and height
  // allow it to move. Else keep it locked to 0,0
  this.maxX = (this.width < this.worldWidth)? this.worldWidth - this.width : 0;
  this.maxY = (this.height < this.worldHeight)? this.worldHeight - this.height : 0;
  
  // Update the current x & y vals if they are now outside the max bounds
  if (this.x > this.maxX) {
    this.x = this.maxX
  }
  if (this.y > this.maxY) {
    this.y = this.maxY
  }
};

// Private

Camera.prototype._addEventListeners = function () {
  var camera = this;
  this.canvas.on('resize', function () {
    camera.width = camera.canvas.width;
    camera.height = camera.canvas.height;
    camera.updateWorldBounds();
  });
};

module.exports = Camera;
},{}],3:[function(require,module,exports){
var Eventer = require('./eventer.js');
var MediaQueryManager = require('./mq_manager.js');

var CanvasManager = function (canvasSelector, scaleType) {
  new Eventer(this);
  this.canvas = document.querySelector(canvasSelector);
  
  if (this.canvas.getContext) {
    this.mq = new MediaQueryManager();
    this.context = this.canvas.getContext('2d');
    this.scaleType = scaleType || 'full';
  
    this._setSizeData();    
    this._addEventListeners();
  }
};

CanvasManager.prototype.clear = function () {
  // clears the canavs so that it is ready to be redrawn
  // TODO: have dirty areas marked for clearing to be more effciant,
  //  rather than clearing the whole thing?
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

// Private

CanvasManager.prototype._addEventListeners = function () {
  var _this = this;
  this.mq.on('resize', function() {
    _this._setSizeData();
    _this.trigger('resize');
  });
};

CanvasManager.prototype._setSizeData = function () {
  // set the current width and height of the canvas
  this._setCanvasSize();
  
  // set the orientation of the canavs and the window
  this.canvasOrientation = (this.width > this.height)? 'landscape' : 'portrait';
  this.windowOrientation = (window.innerWidth > window.innerHeight)? 'landscape' : 'portrait';
  
  // Set the current media query size of the window
  this.mqSize = this.mq.size;
};

CanvasManager.prototype._setCanvasSize = function () {
  this.devicePixelRatio = (window.devicePixelRatio > 1)? window.devicePixelRatio : 1;
  
  if (this.scaleType === 'scale') {
    this._setCanvasSizeToScale();
    
  } else if (this.scaleType === 'full') {
    this._setCanvasSizeToFull();
  }
  
  this.width = this.canvas.width / this.devicePixelRatio;
  this.height = this.canvas.height / this.devicePixelRatio;
  this.context.scale(this.devicePixelRatio, this.devicePixelRatio);
};

CanvasManager.prototype._setCanvasSizeToScale = function () {
  // scale canvas for retina and high pixel devices
  // if scaling only do it the first time
  if (this.width === undefined && this.height === undefined && this.devicePixelRatio > 1) {
    this.canvas.width = this.canvas.width * this.devicePixelRatio;
    this.canvas.height = this.canvas.height * this.devicePixelRatio;
  }
  
  // Scale the canvas down so that it fits the window but keeps it's proportions
  // Scaleing is done with css max-width & max-height
  this.previousWidth = this.width || this.canvas.width;
  this.previousHeight = this.height || this.canvas.height;
  this.canvas.width = this.canvas.width;
  this.canvas.height = this.canvas.height;
};

CanvasManager.prototype._setCanvasSizeToFull = function () {
  // Resize the canvas to fill the window
  this.previousWidth = this.width || window.innerWidth;
  this.previousHeight = this.height || window.innerHeight;
  this.canvas.width = window.innerWidth * this.devicePixelRatio;
  this.canvas.height = window.innerHeight * this.devicePixelRatio;
};

module.exports = CanvasManager;
},{"./eventer.js":5,"./mq_manager.js":10}],4:[function(require,module,exports){
/*
  
  A colliding object should have a flag that says weather it is collidable
  this allows things to be passed through if need be.
  
  A collider will have a master object that is always checked
  and a set of collidable objects which the master is checked against
  
  The test for colliding may differ between layerMap vs layerObject and layerObject vs layerObject?
  There is no (foreseeable) case to check layerMap vs layerMap
  
  an item can collide agains the worlds bounds
  
  A collider has a shape with a width and height which acts as the bounds to check against when detecing collisions
  
*/

var Collider = function (canvas) {
  this.canvas = canvas;
};

// at the very least an object needs to have x,y,width,height
Collider.prototype.collides = function (primaryCollider, secondaryCollider) {
//   console.log(primaryCollider, secondaryCollider);
  if (secondaryCollider.TYPE && secondaryCollider.TYPE === 'LayerMap') {
    // Detect 1 object against a map
    return this.collidesWithMap(primaryCollider, secondaryCollider);
  } else {
    // Detect against 2 objects
    return this.collidesWithObject(primaryCollider, secondaryCollider);
  }
};

Collider.prototype.collidesWithMap = function (primaryObject, map) {
  // get the tiles that the primaryObject covers, startug at the x & y
  // if any tile is solid (> 0) then we have a collision
  var collision = false;
  var primaryObjectWidth = primaryObject.collisionWidth || primaryObject.width || map.tileWidth;
  var primaryObjectHeight = primaryObject.collisionHeight || primaryObject.height || map.tileHeight;
  
  var startCol = Math.floor(primaryObject.x / map.tileWidth);
  var endCol = Math.round(startCol + (primaryObjectWidth / map.tileWidth));
  var startRow = Math.floor(primaryObject.y / map.tileWidth);
  var endRow = Math.round(startRow + (primaryObjectHeight / map.tileHeight));

  for (var c = startCol; c <= endCol; c++) {
    for (var r = startRow; r <= endRow; r++) {
      var tile = map.getMapTile(c, r);
      if (tile > 0) {
        collision = true;
      }
    }
  }
  return collision;
};

Collider.prototype.collidesWithObject = function (primaryObject, secondaryObject) {
};

Collider.prototype.collidesWithWorldBounds = function (primaryObject, world) {
  // TODO detect against world bounds
};

module.exports = Collider;
},{}],5:[function(require,module,exports){
/*
  Custom events object
  - Turns an object into one that can fire custome events: https://gist.github.com/stewartknapman/f49fa09a10bf545610cf
*/

var Eventer = function (caller) {
  caller._events = {};
  caller.on = this.on;
  caller.off = this.off;
  caller.trigger = this.trigger;
  this.caller = caller;
};

// this === caller not the Eventer object
Eventer.prototype.on = function (event, callback) {
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(callback);
  return this._events[event].length - 1;
};

Eventer.prototype.off = function (event, id) {
  if (event && id) {
    if (this._events[event][id]) this._events[event][id] = null;
  } else if (event) {
    if (this._events[event]) this._events[event] = null;
  } else {
    this._events = {};
  }
};

Eventer.prototype.trigger = function (event, args) {
  if (typeof args !== 'object') args = [args]; 
  for (var i in this._events[event]) {
    var e = this._events[event][i];
    if (this._events[event].hasOwnProperty(i) && typeof e === 'function') e.apply(this, args);
  }
};

module.exports = Eventer;
},{}],6:[function(require,module,exports){
/*
  TODO:
    - world vs camera/ world largr than canavs; player centered to canvas
    - collision detection
*/

var CanvasManager = require('./canvas_manager.js');
var StateManager = require('./state_manager.js');
var Loop = require('./loop.js');

var Game = function (canvasSelector, scaleType) {
  this.canvas = new CanvasManager(canvasSelector, scaleType);
  this.stateManager = new StateManager();
  this.loop = new Loop(this.canvas, this.stateManager);
  
  Object.defineProperty(this, 'isRunning', {
    get: function () {
      return this.loop.isRunning;
    }
  });
  
  this._addEventListeners();
};

// Set up states
Game.prototype.newState = function (stateId, stateObj) {
  this.stateManager.addState(stateId, stateObj, this.canvas);
};

Game.prototype.loadState = function (stateId) {
  this.stateManager.loadState(stateId);
};

// Start and Stop Loop

Game.prototype.start = function () {
  this.loop.startLoop();
};

Game.prototype.stop = function (force) {
  this.loop.stopLoop(force);
};

// Private

Game.prototype._addEventListeners = function () {
  var game = this;
  this.canvas.on('resize', function () {
    game.stateManager.resizeCurrentState();
  });
};

module.exports = Game;
},{"./canvas_manager.js":3,"./loop.js":9,"./state_manager.js":12}],7:[function(require,module,exports){
/*
  TODO:
    isometric tile map: https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps#Isometric_tilemaps
    render needs to overlap tiles
*/

var LayerMap = function (canvas, camera, mapID, numRows, numCols, tileWidth, tileHeight, map, sprite, tileStyle) {
  this.TYPE = 'LayerMap';
  
  this.canvas = canvas;
  this.camera = camera;
  this.id = mapID;
  this.map = map;
  this.sprite = sprite || false; // if no sprite is given invoke the draw tile method
  this.tileStyle = tileStyle || 'square'; // styles: isometric or square (default)
  
  this.rows = numRows;
  this.cols = numCols;
  this.tileWidth = tileWidth; // in px
  this.tileHeight = tileHeight; // in px
  this.width = tileWidth * numRows;
  this.height = tileHeight * numCols;
};

LayerMap.prototype.render = function () {
  var startCol = Math.floor(this.camera.x / this.tileWidth);
  var endCol = Math.round(startCol + (this.camera.width / this.tileWidth));
  var startRow = Math.floor(this.camera.y / this.tileHeight);
  var endRow = Math.round(startRow + (this.camera.height / this.tileHeight));
  var offsetX = -this.camera.x + startCol * this.tileWidth;
  var offsetY = -this.camera.y + startRow * this.tileHeight;
  
  for (var c = startCol; c <= endCol; c++) {
    for (var r = startRow; r <= endRow; r++) {
      var tile = this.getMapTile(c, r);
      var x = (c - startCol) * this.tileWidth + offsetX;
      var y = (r - startRow) * this.tileHeight + offsetY;
      if (tile !== 0) { // 0 => empty tile
        if (this.sprite) {
          // TODO: https://github.com/mozdevs/gamedev-js-tiles/blob/gh-pages/square/logic-grid.js#L210-L220
        } else {
          this.drawTile(tile, x, y, c, r);
        }
      }
    }
  }
};

LayerMap.prototype.drawTile = function (tile, x, y) {};

LayerMap.prototype.getMapTile = function (col, row) {
  return this.map[row * this.cols + col]
};

module.exports = LayerMap;
},{}],8:[function(require,module,exports){
/*
  TODO:
  sprite: also needs to know sprite width & height and image width & height
  if sprite width > image width then animate sprite?
  
  behaviours: methods called at a certain point which allow objects to react to something
  
  collisionWidth & collisionHeight are used for collision detection and default to the base width & height
  but can be altered indipendantly through changing the property
  
  The base width & height are used with the sprite
*/

var LayerObject = function (canvas, camera, objectID, x, y, width, height, sprite, behaviors) {
  this.TYPE = 'LayerObject';
  
  this.canvas = canvas;
  this.camera = camera;
  this.id = objectID;
  this.x = x || this.camera.width / 2;
  this.y = y || this.camera.height / 2;
  this.width = width || 1;
  this.height = height || 1;
  this.collisionWidth = this.width;
  this.collisionHeight = this.height;
  
  this.sprite = sprite || false; // <-- TODO
  
  this.behaviors = behaviors || [];
  
  Object.defineProperty(this, '_isFollowed', {
    get: function () {
      return this.camera.following && this.camera.following === this;
    }
  });
};

LayerObject.prototype.update = function () {
  for (var i = 0; i < this.behaviors.length; i++) {
    var behavior = this.behaviors[i];
    if (behavior.execute) {
      behavior.execute.apply(this);
    }
  }
};

LayerObject.prototype.render = function () {
  // x & y offset by camera
  var x = -this.camera.x + this.x;
  var y = -this.camera.y + this.y;
  if (this._isFollowed) {
    x = this.screenX;
    y = this.screenY;
  }
  
  if (this.sprite) {
    // TODO
  } else {
    this.draw(x, y);
  }
};

LayerObject.prototype.draw = function (x, y) {};

module.exports = LayerObject;
},{}],9:[function(require,module,exports){
var instance;
var Loop = function (canvas, stateManager) {
  if (instance) {
    return instance;
  }
  
  this.canvas = canvas;
  this.stateManager = stateManager;
  this.currentLoop = null;
  this.isRunning = false;
  this.blurWhileRunning = false;
  
  this._addEventListeners();
  
  instance = this;
};

Loop.prototype.main = function () {
  var _this = this;
  this.currentLoop = window.requestAnimationFrame(function () { 
    _this.main();
  });
  
  this.canvas.clear();
  this.stateManager.updateCurrentState();
};

Loop.prototype.startLoop = function () {
  // don't cause multiple loops by starting again if it's already running
  if (!this.isRunning) {
    this.isRunning = true;
    this.main();
  }
};

Loop.prototype.stopLoop = function (force) {
  var c = window.cancelAnimationFrame(this.currentLoop);
  this.isRunning = false;

  // Stopped is stopped, don't restart if blured
  // fixes issue when trying to stop from console and blur gets in first
  if (force) {
    this.blurWhileRunning = false;
  }
};

// Private

Loop.prototype._addEventListeners = function () {
  var _this = this;
  window.addEventListener('blur', function () {
    if (_this.isRunning) {
      _this.blurWhileRunning = true;
      _this.stopLoop();
    }
  });
  
  window.addEventListener('focus', function () {
    if (_this.blurWhileRunning) {
      _this.blurWhileRunning = false;
      _this.startLoop();
    }
  });
};

module.exports = Loop;
},{}],10:[function(require,module,exports){
var Eventer = require('./eventer.js');
var instance;

var MediaQueryManager = function () {
  if (instance) {
    return instance;
  }
  
	Object.defineProperty(this, 'size', {
		get: function () {
      var content = window.getComputedStyle(document.body,':after').getPropertyValue('content');
      content = this._removeQuotes(content);
      return JSON.parse(content);
		}
	});
  
  new Eventer(this);
  this._addEventListeners();
  
  instance = this;
};

// Private

MediaQueryManager.prototype._addEventListeners = function () {
  var _this = this;
  window.addEventListener('resize', function (event) {
    _this._onResize(event);
  });
  window.addEventListener('orientationchange', function (event) {
    _this._onResize(event);
  });
};

MediaQueryManager.prototype._onResize = function (event) {
  this.trigger('resize', [this.mqSize]);
};

MediaQueryManager.prototype._removeQuotes = function (string) {
   if (typeof string === 'string' || string instanceof String) {
      string = string.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
   }
   return string;
};

module.exports = MediaQueryManager;
},{"./eventer.js":5}],11:[function(require,module,exports){
var World = require('./world.js');
var Camera = require('./camera');

var State = function (id, object, canvas) {
  this.id = id;
  this.canvas = canvas;
  this.camera = new Camera(canvas);
  this.world = new World(canvas, this.camera);
  
  this._setMethods(object);
};

State.prototype.init = function () {};    // is called when the state is loaded
State.prototype.resize = function () {};  // is called when the screen is resized
State.prototype.destroy = function () {}; // is called when a new state is loaded
State.prototype.update = function () {    // is called during the game loop; is used for updating game logic
  this.world.update();
};

// is called after init, update and resize and redraws the canvas
State.prototype.render = function () {
  this.camera.update();
  this.world.render();
};

// private

State.prototype._setMethods = function (object) {
  for (var method in object) {
    // don't override render method
    if (object.hasOwnProperty(method) && method !== 'render') {
      // make sure update still calls world update
      if (method === 'update') {
        this.update = function () {
          this.world.update();
          object.update.apply(this);
        };
      } else {
        this[method] = object[method];
      }
    }
  }
};

module.exports = State;
},{"./camera":2,"./world.js":13}],12:[function(require,module,exports){
var State = require('./state.js');

var States = function () {
  this.states = {};
  this.currentState = null;
};

States.prototype.addState = function (stateId, stateObj, canvas) {
  this.states[stateId] = new State(stateId, stateObj, canvas);
};

States.prototype.loadState = function (stateId) {
  if (this.currentState) {
    this.currentState.destroy();
  }
  
  this.currentState = this.states[stateId];
  this.currentState.init();
  this.currentState.render();
};

States.prototype.updateCurrentState = function () {
  this.currentState.update();
  this.currentState.render();
};

States.prototype.resizeCurrentState = function () {
  this.currentState.resize();
  this.currentState.render();
};

module.exports = States;
},{"./state.js":11}],13:[function(require,module,exports){
/*
  World has layers
  a layer can be of type map or type object
  
  A layer has a render method
  
  Each state has a new world
  the state renders the world
  this means the world is acessable from inside the state
  
*/
var LayerMap = require('./layer_map.js');
var LayerObject = require('./layer_object.js');
var Collider = require('./collider.js');

var World = function (canvas, camera) {
  this.canvas = canvas;
  this.camera = camera;
  this.layers = [];
  this.collider = new Collider(canvas);
  
  this.setSize(canvas.width, canvas.height);
};

// Setup/Init methods

World.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
  this.camera.updateWorldBounds(width, height);
};

World.prototype.newMapLayer = function (mapID, numRows, numCols, tileWidth, tileHeight, map, sprite, tileStyle) {
  var layer = new LayerMap(this.canvas, this.camera, mapID, numRows, numCols, tileWidth, tileHeight, map, sprite, tileStyle);
  this.layers.push(layer);
  return layer;
};

World.prototype.newObjectLayer = function (objectID, x, y, width, height, sprite, behaviors) {
  var layer = new LayerObject(this.canvas, this.camera, objectID, x, y, width, height, sprite, behaviors);
  this.layers.push(layer);
  return layer;
};

// Loop Methods

World.prototype.update = function () {
  this._eachOfType('LayerObject', function (layer) {
    layer.update();
  });
};

World.prototype.render = function () {
  this._eachLayer(function (layer) {
    layer.render();
  });
};

// Misc

World.prototype.collides = function (primaryColliderObject, secondaryColliderObject) {
  // if no secondary collision object then check against the bounds of the world
  if (secondaryColliderObject) {
    return this.collider.collides(primaryColliderObject, secondaryColliderObject);
  } else {
    return this.collider.collidesWithWorldBounds(primaryColliderObject, this);
  }
};

World.prototype.getLayerByID = function (id) {
  var layer = false;
  if (id) {
    this._eachLayer(function (l) {
      if (l.id === id) {
        layer = l;
      }
    });
  }
  return layer;
};

// Private

World.prototype._eachOfType = function (type, callback) {
  if (type) {
    this._eachLayer(function (layer) {
      if (layer.TYPE === type) {
        callback.apply(this, [layer]);
      }
    });
  }
};

World.prototype._eachLayer = function (callback) {
  for (var l = 0; l < this.layers.length; l++) {
    var layer = this.layers[l];
    if (callback) {
      callback.apply(this, [layer]);
    }
  }
};

module.exports = World;
},{"./collider.js":4,"./layer_map.js":7,"./layer_object.js":8}]},{},[1]);
