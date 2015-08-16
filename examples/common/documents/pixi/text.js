var Node = require("./node");
var pixi = require("pixi.js");



function Text (value) {
  this.nodeValue = value;
  this.target    = new pixi.Sprite();
}

Node.extend(Text, {

  /**
   */

  nodeType: 3,

  /**
   */

  getInnerHTML: function () {
    return this.nodeValue;
  },

  /**
   */

  cloneNode: function () {
     var clone = new Text(this.nodeValue);
    clone._buffer = this._buffer;
    return clone;
  }
});

Object.defineProperty(Text.prototype, "nodeValue", {
  get: function() {
    return this._nodeValue;
  },
  set: function(value) {
    this._nodeValue = value;
    this._triggerChange();
  }
});

module.exports = Text;
