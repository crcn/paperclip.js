var type      = require("type-component"),
ClippedBuffer = require("../../../../../clip/buffer"),
BaseBinding   = require("../../base"),
_             = require("underscore");

function AttrTextBinding (options) {
  BaseBinding.apply(this, arguments);
  this.clippedBuffer = new ClippedBuffer(this.value, options.application);
}

BaseBinding.extend(AttrTextBinding, {
  type: "attr",
  bind: function (context) {
    this.context = context;
    this._binding = this.clippedBuffer.reset(this.context).bind("value", _.bind(this._onChange, this)).now();
  },
  unbind: function () {
    if (this._binding) this._binding.dispose();
    this.clippedBuffer.dispose();
  },
  _onChange: function (text) {
    if (!text.length) {
      return this.node.removeAttribute(this.name);
    }
    this.node.setAttribute(this.name, text);
  },
  test: function (binding) {
    if (type(binding.value) !== "array") {
      return false;
    }
    for (var i = 0, n = binding.value.length; i < n; i++) {
      if (binding.value[i].fn) return true;
    }

    return false;
  }
});


module.exports = AttrTextBinding;
