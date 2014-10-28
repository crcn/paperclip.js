var protoclass = require("protoclass");

function UnboundValueBinding (script, textNode) {
  this.script      = script;
  this.textNode = textNode;
}

protoclass(UnboundValueBinding, {

  /**
   */

  bind: function (context) {
    this.context = context;
    var value = this.script.evaluate(context);
    this.textNode.nodeValue = String(value == null ? "" : value);
  },

  /**
   */

  unbind: function () {
  }
});

module.exports = UnboundValueBinding;