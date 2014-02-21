var protoclass = require("protoclass"),
BaseBinder     = require("../base/binder"),
TextBinding    = require("./binding");

function TextBlockBinder (options) {
  BaseBinder.apply(this, arguments);
  this.blocks = options.blocks;
}

BaseBinder.extend(TextBlockBinder, {

  /**
   */

  getBinding: function (templateNode) {
    var mark = this._findMark(templateNode);
    console.log("RET BINDING")
    return new TextBinding(mark, this.blocks, this.application);
  }
});

module.exports = TextBlockBinder;