var protoclass = require("protoclass"),
utils          = require("../../../utils");

function BlockBinding (node, script, view) {
  this.view   = view;
  this.script = script;
  this.node   = node;
}

module.exports = protoclass(BlockBinding, {
  bind: function (context) {
    var self = this;
    var v = this.script.evaluate(context)
    self.node.replaceText(String(v == null ? "" : v), true);
  }
});