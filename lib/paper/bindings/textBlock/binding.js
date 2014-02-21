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
    return this._binding = this.clip.reset(context).bind("text", _.bind(this._onChange, this)).now();
  },

  /**
   */

  unbind: function () {
    this._binding.dispose();
  },

  /**
   */

  _onChange: function (text) {

    this.node.nodeValue = String(text);

    if (this.node.replaceText) {
      this.node.replaceText(text, true);
    }
  }

});

module.exports = TextBlockBinding;

