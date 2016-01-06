(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../../src/game.js":5}],2:[function(require,module,exports){
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
},{"./eventer.js":4,"./mq_manager.js":9}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{"./canvas_manager.js":3,"./loop.js":8,"./state_manager.js":11}],6:[function(require,module,exports){
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
  var endCol = startCol + (this.camera.width / this.tileWidth);
  var startRow = Math.floor(this.camera.y / this.tileHeight);
  var endRow = startRow + (this.camera.height / this.tileHeight);
  var offsetX = -this.camera.x + startCol * this.tileWidth;
  var offsetY = -this.camera.y + startRow * this.tileHeight;
  
  for (var c = startCol; c <= endCol; c++) {
    for (var r = startRow; r <= endRow; r++) {
      var tile = this._getMapTile(c, r);
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

// Private

LayerMap.prototype._getMapTile = function (col, row) {
  return this.map[row * this.cols + col]
};

module.exports = LayerMap;
},{}],7:[function(require,module,exports){
/*
  TODO:
  sprite: also needs to know sprite width & height and image width & height
  if sprite width > image width then animate sprite?
  
  behaviours: methods called at a certain point which allow objects to react to something
  
  
*/

var LayerObject = function (canvas, camera, objectID, x, y, behaviors) {
  this.TYPE = 'LayerObject';
  
  this.canvas = canvas;
  this.camera = camera;
  this.id = objectID;
  this.x = x || this.camera.width / 2;
  this.y = y || this.camera.height / 2;
  this.sprite = false; // <-- TODO
  
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{"./eventer.js":4}],10:[function(require,module,exports){
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
},{"./camera":2,"./world.js":12}],11:[function(require,module,exports){
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
},{"./state.js":10}],12:[function(require,module,exports){
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

var World = function (canvas, camera) {
  this.canvas = canvas;
  this.camera = camera;
  this.layers = [];
  
  this.setSize(canvas.width, canvas.height);
};

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

World.prototype.newObjectLayer = function (objectID, x, y) { // worldX, worldY, width, height ???
  var layer = new LayerObject(this.canvas, this.camera, objectID, x, y);
  this.layers.push(layer);
  return layer;
};

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
},{"./layer_map.js":6,"./layer_object.js":7}]},{},[1]);
