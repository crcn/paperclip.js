var Container = require("./container");
var pixi      = require("pixi.js");

function Fragment () {
  Fragment.superclass.call(this, new pixi.Container());
}

Container.extend(Fragment, {

  /**
   */

  nodeType: 11,

  /**
   */

  getInnerHTML: function () {
    return this.childNodes.join("");
  },

  /**
   */

  cloneNode: function () {
    var clone = new Fragment();

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      clone.appendChild(this.childNodes[i].cloneNode());
    }

    clone._buffer = this._buffer;

    return clone;
  }
});

module.exports = Fragment;