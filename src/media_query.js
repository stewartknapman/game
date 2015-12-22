var instance;
var MediaQuery = function () {
  if (instance) {
    return instance;
  }
  
  instance = this;
};

module.exports = MediaQuery;