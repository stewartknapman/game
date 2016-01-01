(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  TODO:
    - collision detection
    - make bb-8's orange circles better
*/

var Game = require('../../src/game.js');
var game = new Game('#main');
var canvas = game.canvas;
window.game = game;

game.newState('demo', {
  init: function () {
    this.playerV = 5;
    this.playerX = Math.round(canvas.width / 2);
    this.playerY = Math.round(canvas.height / 2);
    this.targetX = this.playerX;
    this.targetY = this.playerY;
    
    this.gridSize = 60;
    this.worldSize = 2100;
    this.wallFrequency = 10;
    this.walls = this.buildWalls();
    
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
},{"../../src/game.js":4}],2:[function(require,module,exports){
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
},{"./eventer.js":3,"./mq_manager.js":6}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
/*
  TODO:
    - pause/stop on window blur
    - world vs camera/ world largr than canavs; player centered to canvas
    - collision detection
    - rename window size manager and use height mq's as well as width ones
*/

var CanvasManager = require('./canvas_manager.js');
var StateManager = require('./state_manager.js');
var Loop = require('./loop.js');

var Game = function (canvasSelector, scaleType) {
  this.canvas = new CanvasManager(canvasSelector, scaleType);
  this.stateManager = new StateManager(this.canvas);
  this.loop = new Loop(this.stateManager);
  
  Object.defineProperty(this, 'isRunning', {
    get: function () {
      return this.loop.isRunning;
    }
  });
  
  
  this._addEventListeners();
};

// Set up states
Game.prototype.newState = function (stateId, stateObj) {
  this.stateManager.addState(stateId, stateObj);
};

Game.prototype.loadState = function (stateId) {
  this.stateManager.loadState(stateId);
};

// Start and Stop(?)

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
},{"./canvas_manager.js":2,"./loop.js":5,"./state_manager.js":8}],5:[function(require,module,exports){
var instance;
var Loop = function (stateManager) {
  if (instance) {
    return instance;
  }
  
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
},{}],6:[function(require,module,exports){
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
},{"./eventer.js":3}],7:[function(require,module,exports){
var State = function (id, object) {
  this.id = id;
  this._setMethods(object);
};

State.prototype.init = function () { console.log('default init') };
State.prototype.update = function () { console.log('default update') };
State.prototype.destroy = function () { console.log('default destroy') };
State.prototype.render = function () { console.log('default render') };
State.prototype.resize = function () { console.log('default resize') };

// private

State.prototype._setMethods = function (object) {
  for (var method in object) {
    if (object.hasOwnProperty(method)) {
      this[method] = object[method];
    }
  }
};

module.exports = State;
},{}],8:[function(require,module,exports){
var State = require('./state.js');

var States = function (canvas) {
  this.canvas = canvas;
  this.states = {};
  this.currentState = null;
};

States.prototype.addState = function (stateId, stateObj) {
  this.states[stateId] = new State(stateId, stateObj);
};

States.prototype.loadState = function (stateId) {
  if (this.currentState) {
    this.currentState.destroy();
    this.canvas.clear();
  }
  
  this.currentState = this.states[stateId];
  this.currentState.init();
  this.currentState.render();
};

States.prototype.updateCurrentState = function () {
  this.currentState.update();
  this.canvas.clear();
  this.currentState.render();
};

States.prototype.resizeCurrentState = function () {
  this.currentState.resize();
  this.canvas.clear();
  this.currentState.render();
};

module.exports = States;
},{"./state.js":7}]},{},[1]);
