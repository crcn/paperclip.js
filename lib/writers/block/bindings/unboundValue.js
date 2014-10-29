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

    if (value == null) value = "";

    if (this.textNode.__isNode) {
      this.textNode.replaceText(value, true);
    } else {
      this.textNode.nodeValue = value;
    }
  },

  /**
   */

  unbind: function () {
  }
});

module.exports = UnboundValueBinding;