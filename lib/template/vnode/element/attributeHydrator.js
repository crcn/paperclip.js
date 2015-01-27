var protoclass        = require("protoclass"),
utils                 = require("../../../utils"),
createDocumentSection = require("document-section"),
BindableObject        = require("bindable-object"),
AttributesBinding     = require("./attributesBinding");

function AttributeHydrator (name, attributes, childTemplate, section, componentClass) {
  this.name           = name;
  this.attributes     = attributes;
  this.childTemplate  = childTemplate;
  this.section        = section;
  this.componentClass = componentClass;
}

module.exports = protoclass(AttributeHydrator, {
  initialize: function () {

  },
  hydrate: function (view) {
    
  }
});