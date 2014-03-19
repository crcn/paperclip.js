var protoclass = require("protoclass");

function BaseBinder (options) {
  this.marker      = options.marker;
  this.application = options.application;
}

protoclass(BaseBinder, {

  /**
   */

  init: function () {
    this._findPathToMarker();
  },

  /**
   */

  getBinding: function (node) {

  },

  /**
   */

  _findMark: function (node) {

    var cn = node;

    while (cn.parentNode) {
      cn = cn.parentNode;
    }

    for (var i = 0, n = this.pathLength; i < n; i++) {
      cn = cn.childNodes[this.path[i]];
    }

    return cn;
  },

  /**
   */

  _findPathToMarker: function () {
    var path = [], 
    marker = this.marker,
    cn = marker;

    while (cn.parentNode) {
      var children = [];

      for (var i = 0, n = cn.parentNode.childNodes.length; i < n; i++) {
        children.push(cn.parentNode.childNodes[i]);
      }

      path.unshift(children.indexOf(cn));

      cn = cn.parentNode;
    }

    this.path = path;
    this.pathLength = path.length;
  }
});

module.exports = BaseBinder;