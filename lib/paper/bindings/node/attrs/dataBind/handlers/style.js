var BaseDataBinding = require("./base"),
noselector = require("noselector");

function StyleAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(StyleAttrBinding, {
  bind: function (context) {
    this._currentStyles = {};
    BaseDataBinding.prototype.bind.call(this, context);
  },
  _onChange: function (styles) {

    var newStyles = {};

    for (var name in styles) {
      var style = styles[name];
      if (style !== this._currentStyles[name]) {
        newStyles[name] = this._currentStyles[name] = style || "";
      }
    }

    if (!process.browser) {
      for (var key in newStyles) {
        this.node.style[key] = newStyles[key];
      }
    } else {
      noselector(this.node, this.application.nodeFactory).css(newStyles);
    }
  }
});

module.exports = StyleAttrBinding;
