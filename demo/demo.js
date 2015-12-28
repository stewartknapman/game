(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Game = require('../../../src/game.js');
var game = new Game('#main');
window.game = game;

game.newState('demo', {
  init: function () {
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
      
      this.move(diffX, diffY, diffX_pos, diffY_pos, velocity);
    }
  },
  
  move: function (diffX, diffY, diffX_pos, diffY_pos, velocity) {
    // move along the shortest axis until it's the same as the target
    // then move along the remaining axis
    // TODO: collision detection
    
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
    // body
    game.canvas.context.fillStyle = '#eee';
    game.canvas.context.strokeStyle = '#333';
    game.canvas.context.beginPath();
    game.canvas.context.arc(this.playerX, this.playerY, 20, 0, 360);
    game.canvas.context.fill();
    game.canvas.context.stroke();
    
    // orange dot
    game.canvas.context.fillStyle = '#ca601e';
    game.canvas.context.strokeStyle = '#ca601e';
    game.canvas.context.beginPath();
    game.canvas.context.arc(this.playerX, this.playerY, 12, 0, 360);
    game.canvas.context.fill();
    game.canvas.context.stroke();
    
    // silver dot
    game.canvas.context.fillStyle = '#ddd';
    game.canvas.context.beginPath();
    game.canvas.context.arc(this.playerX, this.playerY, 8, 0, 360);
    game.canvas.context.fill();
    
    // head
    game.canvas.context.fillStyle = '#eee';
    game.canvas.context.strokeStyle = '#333';
    game.canvas.context.beginPath();
    game.canvas.context.arc(this.playerX, this.playerY - 22, 10, (Math.PI/180)*150, (Math.PI/180)*30);
    game.canvas.context.arc(this.playerX, this.playerY - 42, 26, (Math.PI/180)*71, (Math.PI/180)*109);
    game.canvas.context.fill();
    game.canvas.context.stroke();
    
    // eyes
    game.canvas.context.fillStyle = '#333';
    game.canvas.context.strokeStyle = '#333';
    game.canvas.context.beginPath();
    game.canvas.context.arc(this.playerX, this.playerY - 25, 3, 0, 360);
    game.canvas.context.fill();
    game.canvas.context.stroke();
    
    game.canvas.context.fillStyle = '#333';
    game.canvas.context.strokeStyle = '#333';
    game.canvas.context.beginPath();
    game.canvas.context.arc(this.playerX + 5, this.playerY - 21, 1, 0, 360);
    game.canvas.context.fill();
    game.canvas.context.stroke();
    
    // antenia
    game.canvas.context.fillStyle = '#333';
    game.canvas.context.strokeStyle = '#333';
    game.canvas.context.beginPath();
    game.canvas.context.moveTo(this.playerX, this.playerY - 30);
    game.canvas.context.lineTo(this.playerX, this.playerY - 40);
    game.canvas.context.stroke();
    game.canvas.context.closePath();
    
  }
});

game.loadState('demo');
game.start();
},{"../../../src/game.js":4}],2:[function(require,module,exports){
var Eventer = require('./eventer.js');
var WindowSizeManager = require('./window_size_manager.js');

var CanvasManager = function (canvasSelector, scaleType) {
  new Eventer(this);
  this.canvas = document.querySelector(canvasSelector);
  
  if (this.canvas.getContext) {
    this.window = new WindowSizeManager();
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
  this.canvas.width = this.canvas.width;
};

// Private

CanvasManager.prototype._addEventListeners = function () {
  var _this = this;
  this.window.on('resize', function() {
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
  this.windowMQSize = this.window.mqSize;
};

CanvasManager.prototype._setCanvasSize = function () {
  if (this.scaleType === 'scale') {
    // Scale the canvas down so that it fits the window but keeps it's proportions
    // Scaleing is done with css max-width & max-height
    this.previousWidth = this.width || this.canvas.width;
    this.previousHeight = this.height || this.canvas.height;
    this.width = this.canvas.width = this.canvas.width;
    this.height = this.canvas.height = this.canvas.height;
  } else if (this.scaleType === 'full') {
    // Resize the canvas to fill the window
    this.previousWidth = this.width || window.innerWidth;
    this.previousHeight = this.height || window.innerHeight;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }
};

module.exports = CanvasManager;
},{"./eventer.js":3,"./window_size_manager.js":8}],3:[function(require,module,exports){
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
    pause/stop on window blur
*/

var CanvasManager = require('./canvas_manager.js');
var StateManager = require('./state_manager.js');
var Loop = require('./loop.js');

var Game = function (canvasSelector, scaleType) {
  var scaleType = scaleType || 'full';
  
  this.canvas = new CanvasManager(canvasSelector, scaleType);
  this.stateManager = new StateManager(this.canvas);
  this.loop = new Loop(this.stateManager);
  
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
},{"./canvas_manager.js":2,"./loop.js":5,"./state_manager.js":7}],5:[function(require,module,exports){
var instance;
var Loop = function (stateManager) {
  if (instance) {
    return instance;
  }
  
  this.stateManager = stateManager;
  this.currentLoop = null;
  
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
  this.main();
};

Loop.prototype.stopLoop = function () {
  window.cancelAnimationFrame(this.currentLoop);
};

module.exports = Loop;
},{}],6:[function(require,module,exports){
/*
  Pre and post methods could be interesting (?)
*/

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
},{}],7:[function(require,module,exports){
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
},{"./state.js":6}],8:[function(require,module,exports){
var Eventer = require('./eventer.js');
var instance;

var WindowSizeManager = function () {
  if (instance) {
    return instance;
  }
  
	Object.defineProperty(this, 'mqSize', {
		get: function () {
      return window.getComputedStyle(document.body,':after')
      .getPropertyValue('content')
      .replace(/['"]/g, '');
		}
	});
  
  new Eventer(this);
  this._addEventListeners();
  
  instance = this;
};

// Private

WindowSizeManager.prototype._addEventListeners = function () {
  var _this = this;
  window.addEventListener('resize', function (event) {
    _this._onResize(event);
  });
  window.addEventListener('orientationchange', function (event) {
    _this._onResize(event);
  });
};

WindowSizeManager.prototype._onResize = function (event) {
  this.trigger('resize', [this.mqSize]);
};

module.exports = WindowSizeManager;
},{"./eventer.js":3}]},{},[1]);
