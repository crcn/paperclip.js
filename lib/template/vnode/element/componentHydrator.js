var protoclass        = require("protoclass"),
utils                 = require("../../../utils"),
createDocumentSection = require("document-section"),
BindableObject        = require("bindable-object"),
AttributesBinding     = require("./attributesBinding");

function ComponentHydrator (name, attributes, childTemplate, section, componentClass) {
  this.name           = name;
  this.attributes     = attributes;
  this.childTemplate  = childTemplate;

  // TODO - section shouldn't be here. marker should be.
  this.section        = section;
  this.componentClass = componentClass;
}

module.exports = protoclass(ComponentHydrator, {
  initialize: function () {
    this.sectionMarker = this.section.createMarker();
  },
  hydrate: function (view) {
    var clonedSection = this.sectionMarker.getSection(view.rootNode);

    // TODO - bind script attrs to these attrs
    var attributes = new BindableObject(this.attributes);

    var component = new this.componentClass({
      name          : this.name,
      section       : clonedSection,
      attributes    : attributes,
      view          : view,
      childTemplate : this.childTemplate
    });

    view.bindings.push(new AttributesBinding(attributes, this.attributes, component, view));

    
    // is it bindable?
    if (component.bind) view.bindings.push(component);
  }
});