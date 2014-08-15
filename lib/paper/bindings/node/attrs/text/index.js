var type      = require("type-component"),
ClippedBuffer = require("../../../../../clip/buffer"),
BaseBinding   = require("../../base"),
_             = require("underscore");

function NodeAttrBinding (options) {
  BaseBinding.apply(this, arguments);

  if (typeof this.value !== "string") {
    this.clippedBuffer = new ClippedBuffer(this.value, options.application);
  }
}

BaseBinding.extend(NodeAttrBinding, {
  type: "attr",
  bind: function (context) {
    this.context = context;

    if (this.clippedBuffer) {
      this._binding = this.clippedBuffer.reset(this.context).bind("value", _.bind(this._onChange, this)).now();
    }
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
      if (binding.value[i].run) return true;
    }

    return false;
  }
});


module.exports = NodeAttrBinding;
