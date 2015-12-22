var instance;
var WindowSizeManager = function () {
  if (instance) {
    return instance;
  }
  
  instance = this;
};

module.exports = WindowSizeManager;