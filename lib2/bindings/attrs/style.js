var BaseBinding = require("./base");

function StyleBinding (view, node, script, attrName) {
  this.view     = view;
  this.node     = node;
  this.script   = script;
  this.attrName = attrName;
}

BaseBinding.extend(StyleBinding, {

  bind: function (context) {
    this._currentStyles = {};
    BaseBinding.prototype.bind.call(this, context);
  },

  /**
   */

  didChange: function (styles) {
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
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1 && typeof attrValue[0] === "object";
  }
});


module.exports = StyleBinding;