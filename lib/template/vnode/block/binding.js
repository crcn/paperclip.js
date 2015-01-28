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

    // TODO - needs to update on rAF
    this.binding = this.script.bind(context, function (value, oldValue) {
      if (value === oldValue) return;

      var v = String(value == null ? "" : value);

      if (self.nodeFactory.name !== "dom") {
        self.node.replaceText(v, true);
      } else {
        self.node.nodeValue = String(v);
      }
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