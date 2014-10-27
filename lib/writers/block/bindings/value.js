var protoclass = require("protoclass");

function BoundValueBinding (view, script, textNode) {
  this.view       = view;
  this.script     = script;
  this.textNode   = textNode;
}

protoclass(BoundValueBinding, {

  /**
   */

  bind: function (context) {
    this.context = context;
    var self = this;
    this._scriptBinding = this.script.bind(context, function (value) {
      if (self.textNode.replaceText) {
        self.textNode.replaceText(value);
      } else {
        self.textNode.nodeValue = String(value);
      }
    }).now();
  },

  /**
   */

  unbind: function () {
    if (this._scriptBinding) {
      this._scriptBinding.dispose();
      this._scriptBinding = void 0;
    }
  }
});

module.exports = BoundValueBinding;