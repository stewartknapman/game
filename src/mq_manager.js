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