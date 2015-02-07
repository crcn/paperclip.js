var protoclass = require("protoclass");
var utils      = require("../../../utils");

/**
 */

function AttributesBinding(attributes, rawAttributes, component, view) {
  this.attributes    = attributes;
  this.rawAttributes = rawAttributes;
  this.component     = component;
  this.view          = view;
}

/**
 */

module.exports = protoclass(AttributesBinding, {

  /**
   */

  bind: function() {
    this.bindings = [];
    for (var k in this.rawAttributes) {
      var v = this.rawAttributes[k];
      if (v.watch && v.evaluate) {
        this._bindAttr(k, v);
      } else {
        this.attributes[k] = v;
      }
    }
  },

  /**
   */

  _bindAttr: function(k, v) {
    var self = this;

    this.bindings.push(v.watch(this.view, function(nv, ov) {
      self.attributes[k] = nv;
      self.view.runloop.deferOnce(self.component);
    }));

    self.attributes[k] = v.evaluate(this.view);

  },

  /**
   */

  unbind: function() {
    if (!this.bindings) return;
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].dispose();
    }
    this.bindings = [];
  }
});
