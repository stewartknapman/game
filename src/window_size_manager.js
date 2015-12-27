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