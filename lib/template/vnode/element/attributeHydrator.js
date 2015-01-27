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

      // attribute handlers can only be added to real elements for now since
      // components can have any number of dynamic text/element children - which won't
      // have attribute handlers attached to them such as onClick, onEnter, etc.
      node: view.section.start.nextSibling,
      view: view,
      key: this.key,
      value: this.value
    });

    view.bindings.push(attribute);
  }
});