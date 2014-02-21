var BaseWriter  = require("./base"),
TextBlockBinder = require("../bindings/textBlock/binder");

function TextBlockWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(TextBlockWriter, {

  /**
   */

  write: function (blocks) {

    var node = this.nodeFactory.createTextNode("");

    this.binders.push(new TextBlockBinder({
      marker      : node,
      blocks      : blocks,
      application : this.application
    }))

    return node;
  }
});

module.exports = TextBlockWriter;