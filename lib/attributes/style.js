var Base = require("./base");

/**
 */

module.exports = Base.extend({

  /**
   */

  initialize: function() {
    this._currentStyles = {};
  },

  /**
   */

  update: function() {

    var styles = this.value;

    if (typeof styles === "string") {
      this.node.setAttribute("style", styles);
      return;
    }

    var newStyles = {};

    for (var name in styles) {
      var style = styles[name];
      if (style !== this._currentStyles[name]) {
        newStyles[name] = this._currentStyles[name] = style || "";
      }
    }

    for (var key in newStyles) {
      this.node.style[key] = newStyles[key];
    }
  }
});

/**
 */


module.exports.test = function(vnode, key, value) {
  return typeof value !== "string";
};
