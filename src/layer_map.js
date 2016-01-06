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