var Game = require('../../../src/game.js');
var game = new Game('#main');
window.game = game;

var tick = 0;

game.newState('demo', {
  init: function () { console.log('init'); },
  update: function () { console.log('update', tick); tick++; },
  destroy: function () { console.log('destroy'); },
  resize: function () { console.log('resize'); }
});

game.loadState('demo');
// game.start();