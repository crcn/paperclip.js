var protoclass = require("protoclass"),
Base = require("../../../bindings/block/base");

function BoundValueBinding (view, script, textNode) {
  this.view       = view;
  this.mainScript     = script;
  this.application = view.template.application;
  this.textNode   = textNode;
  this.nodeFactory = view.template.application.nodeFactory;
}

Base.extend(BoundValueBinding, {

  /**
   */

  didChange: function (value) {
    
    if (value == null) value = "";
    if (this.nodeFactory.name === "dom") {
      this.textNode.nodeValue = String(value);
    } else {
      this.textNode.replaceText(value, true);
    }
  }
});

module.exports = BoundValueBinding;