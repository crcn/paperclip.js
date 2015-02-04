var protoclass = require("protoclass"),
utils          = require("../../../utils"),
_bind          = require("../../../utils/bind");

function BlockBinding (node, script, view) {
  this.view   = view;
  this.nodeFactory = view.template.nodeFactory;
  this.script = script;
  this.node   = node;
  this.didChange = _bind(this.didChange, this);
}

module.exports = protoclass(BlockBinding, {
  bind: function (scope) {
    var self = this;

    // TODO - needs to update on rAF
    this.binding = this.script.bind(scope, function (value, oldValue) {
      if (value === self.currentValue) return;
      self.currentValue = value;
      self.didChange();
    });

    this.currentValue = this.script.evaluate(scope);
    if (this.currentValue != null) this.update();
  },
  didChange: function () {
    this.view.runloop.deferOnce(this.update, this);
  },
  update: function () {
    var v = String(this.currentValue == null ? "" : this.currentValue);
    if (this.nodeFactory.name !== "dom") {
      this.node.replaceText(this.currentValue, true);
    } else {
      this.node.nodeValue = String(this.currentValue);
    }
  },
  unbind: function () {
    if (this.binding) {
      this.binding.dispose();
      this.binding = void 0;
    }
  }
});