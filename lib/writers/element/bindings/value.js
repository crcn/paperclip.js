var protoclass = require("protoclass");

function ValueAttrBinding (view, node, scripts, attrName) {
  this.view     = view;
  this.node     = node;
  this.scripts  = scripts;
  this.attrName = attrName
}

protoclass(ValueAttrBinding, {

  /**
   */

  bind: function (context) {
    var self = this;
    this.context = context;
    
    this._scriptBinding = this.scripts.value.bind(context, function (value, oldValue) {
      if (value === oldValue) return;
      self.didChange(value, oldValue);
    });

    this._scriptBinding.now();
  },

  /**
   */

  unbind: function () {
    this._scriptBinding.dispose();
  },

  /**
   */

  didChange: function (value) {
    this.node.setAttribute(this.attrName, value);
  }
});

module.exports = ValueAttrBinding;