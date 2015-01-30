var ScriptAttribute = require("./script");

/**
 */

module.exports = ScriptAttribute.extend({

  /**
   */
   
  bind: function (context) {
    this._currentStyles = {};
    ScriptAttribute.prototype.bind.call(this, context);
  },

  /**
   */

  update: function () {

    var styles = this.currentValue;

    var newStyles = {};

    for (var name in styles) {
      var style = styles[name];
      if (style !== this._currentStyles[name]) {
        newStyles[name] = this._currentStyles[name] = style || "";
      }
    }


    if (this.node.__isNode) {
      this.node.style.setProperties(newStyles);
    } else {
      for (var key in newStyles) {
        this.node.style[key] = newStyles[key];
      }
    }
  }
});

/**
 */

module.exports.test = function (value) {
  return typeof value === "object" && !value.buffered;
}

