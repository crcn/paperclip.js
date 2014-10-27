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
    this.textNode.nodeValue = String(this.script.evaluate(context));
  },

  /**
   */

  unbind: function () {
  }
});

module.exports = UnboundValueBinding;