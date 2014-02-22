var protoclass = require("protoclass"),
BaseBinding    = require("../base/binding"),
ClippedBuffer  = require("../../../clip/buffer"),
_              = require("underscore");

function TextBlockBinding (textNode, blocks, application) {
  this.node        = textNode;
  this.blocks      = blocks;
  this.application = application;
  this.clip        = new ClippedBuffer(blocks, application);
}

BaseBinding.extend(TextBlockBinding, {

  /**
   */

  bind: function (context) {
    return this._binding = this.clip.reset(context).bind("value", _.bind(this.animate, this)).now();
  },

  /**
   */

  unbind: function () {
    this._binding.dispose();
  },

  /**
   */

  update: function () {
    this.node.nodeValue = String(this.clip.value);

    if (this.node.replaceText) {
      this.node.replaceText(this.clip.value, true);
    }
  }

});

module.exports = TextBlockBinding;

