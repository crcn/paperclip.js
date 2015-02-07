var protoclass = require("protoclass");
var utils      = require("../../../utils");
var _bind      = require("../../../utils/bind");

/**
 */

function BlockBinding(node, script, view) {
  this.view   = view;
  this.nodeFactory = view.template.nodeFactory;
  this.script = script;
  this.node   = node;
  this.didChange = _bind(this.didChange, this);
}

/**
 */

module.exports = protoclass(BlockBinding, {

  /**
   */

  bind: function() {
    var self = this;

    this.binding = this.script.watch(this.view, function(value, oldValue) {
      if (value === self.currentValue) return;
      self.currentValue = value;
      self.didChange();
    });

    this.currentValue = this.script.evaluate(this.view);
    if (this.currentValue != null) this.update();
  },

  /**
   */

  didChange: function() {
    this.view.runloop.deferOnce(this);
  },

  /**
   */

  update: function() {
    var v = String(this.currentValue == null ? "" : this.currentValue);
    if (this.nodeFactory.name !== "dom") {
      this.node.replaceText(v, true);
    } else {
      this.node.nodeValue = String(v);
    }
  },

  /**
   */

  unbind: function() {
    if (this.binding) {
      this.binding.dispose();
      this.binding = void 0;
    }
  }
});
