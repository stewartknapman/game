var State = function (id, object) {
  this.id = id;
  this._setMethods(object);
};

State.prototype.init = function () { console.log('default init') };
State.prototype.update = function () { console.log('default update') };
State.prototype.destroy = function () { console.log('default destroy') };
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