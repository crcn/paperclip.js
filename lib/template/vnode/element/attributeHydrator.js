var protoclass        = require("protoclass"),
utils                 = require("../../../utils"),
createDocumentSection = require("document-section"),
BindableObject        = require("bindable-object"),
AttributesBinding     = require("./attributesBinding");

function AttributeHydrator (attrClass, key, value, node) {
  this.node      = node;
  this.key       = key;
  this.value     = value;
  this.attrClass = attrClass;
}

module.exports = protoclass(AttributeHydrator, {
  initialize: function () {

  },
  hydrate: function (view) {
    var attribute = new this.attrClass({
      node: this.node,
      view: view,
      key: this.key,
      value: this.value
    });

    view.bindings.push(attribute);
  }
});