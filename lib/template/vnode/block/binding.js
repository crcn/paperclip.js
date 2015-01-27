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

    // TODO - needs to update on rAF
    this.binding = this.script.bind(context, function (value, oldValue) {
      if (value === oldValue) return;
      self.node.replaceText(value);
    });

    this.binding.now();
  },
  unbind: function () {
    if (this.binding) {
      this.binding.dispose();
      this.binding = void 0;
    }
  }
});