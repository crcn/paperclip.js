var protoclass = require("protoclass");

function BoundValueBinding (view, script, textNode) {
  this.view       = view;
  this.script     = script;
  this.textNode   = textNode;
  this.nodeFactory = view.template.application.nodeFactory;
}

protoclass(BoundValueBinding, {

  /**
   */

  bind: function (context) {
    this.context = context;
    var self = this;
    this._scriptBinding = this.script.bind(context, function (value) {
      if (self.nodeFactory.name === "dom") {
        self.textNode.nodeValue = String(value);
      } else {
        self.textNode.replaceText(value, true);
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