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
  // TODO: https://github.com/mozdevs/gamedev-js-tiles/blob/gh-pages/square/logic-grid.js#L76-L102
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

Game.prototype.stop = function () {
  this.loop.stopLoop();
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
*/

var LayerObject = function (canvas, camera, objectID, x, y) {
  this.canvas = canvas;
  this.camera = camera;
  this.id = objectID;
  this.x = x || this.camera.width / 2;
  this.y = y || this.camera.height / 2;
};

LayerObject.prototype.render = function () {
  this.draw(this.x, this.y);
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

Loop.prototype.stopLoop = function () {
  window.cancelAnimationFrame(this.currentLoop);
  this.isRunning = false;
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
State.prototype.update = function () {};  // is called during the game loop; is used for updating game logic
State.prototype.resize = function () {};  // is called when the screen is resized
State.prototype.destroy = function () {}; // is called when a new state is loaded

// is called after init, update and resize and redraws the canvas
State.prototype.render = function () {
  this.camera.update();
  this.world.render();
};

// private

State.prototype._setMethods = function (object) {
  for (var method in object) {
    if (object.hasOwnProperty(method) && method !== 'render') {
      this[method] = object[method];
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
  
  
  
  
  
  // TODO
  // needs render method where the object is drawn or sprite is added to context
  // do we have a second method or animating?
};

World.prototype.render = function () {
  this._eachLayer(function (layer) {
    layer.render();
  });
};

// Private

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