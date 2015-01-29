var protoclass = require("protoclass"),
utils          = require("../../../utils");

function BlockBinding (node, script, view) {
  this.view   = view;
  this.nodeFactory = view.template.nodeFactory;
  this.script = script;
  this.node   = node;
}

module.exports = protoclass(BlockBinding, {
  bind: function (context) {
    var self = this;
    var value = this.script.evaluate(context)

    var v = String(value == null ? "" : value);

    if (this.nodeFactory.name !== "dom") {
      this.node.replaceText(v, true);
    } else {
      this.node.nodeValue = String(v);
    }
  },
  unbind: function () { }
});