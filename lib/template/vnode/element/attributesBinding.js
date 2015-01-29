var protoclass = require("protoclass"),
utils          = require("../../../utils");

function AttributesBinding (attributes, rawAttributes, component, view) {
  this.attributes    = attributes;
  this.rawAttributes = rawAttributes;
  this.component     = component;
  this.view          = view;
}

module.exports = protoclass(AttributesBinding, {
  bind: function (context) {
    this.bindings = [];
    for (var k in this.rawAttributes) {
      var v = this.rawAttributes[k];
      if (v.bind) {
        this._bindAttr(context, k, v);
      } else {
        this.attributes.set(k, v);
      }
    }
  },
  _bindAttr: function (context, k, v) {
    var self = this;
    this.bindings.push(v.bind(context, function (nv, ov) {
      self.attributes.set(k, nv);
    }).now());
  },
  unbind: function () {
    if (!this.bindings) return;
    for (var i = this.bindings.length; i--;)  this.bindings[i].dispose();
    this.bindings = [];
  }
});