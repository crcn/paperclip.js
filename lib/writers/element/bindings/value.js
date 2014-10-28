var protoclass = require("protoclass");

function ValueAttrBinding (view, node, script, attrName) {
  this.view     = view;
  this.node     = node;
  this.script   = script;
  this.attrName = attrName
}

protoclass(ValueAttrBinding, {

  /**
   */

  bind: function (context) {
    var self = this;
    this.context = context;
    
    this._scriptBinding = this.script.bind(context, function (value, oldValue) {
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