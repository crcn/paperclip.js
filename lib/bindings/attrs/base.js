var protoclass = require("protoclass");

function BaseAttrBinding (view, node, script, attrName) {
  this.view     = view;
  this.node     = node;
  this.script   = script;
  this.attrName = attrName
}

protoclass(BaseAttrBinding, {

  /**
   */

  bind: function (context) {
    var self = this;
    this.context = context;
    this._scriptBinding = this.script.bind(context, function (value, oldValue) {
      if (value === oldValue) return;
      self.didChange(value, oldValue);
    });

    this._scriptBinding.now()
  },

  /**
   */

  unbind: function () {
    this._scriptBinding.dispose();
  },

  /**
   */

  didChange: function () {
    // override me
  }
});

module.exports = BaseAttrBinding;