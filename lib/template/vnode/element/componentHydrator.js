var protoclass        = require("protoclass"),
utils                 = require("../../../utils"),
createDocumentSection = require("document-section"),
BindableObject        = require("bindable-object"),
AttributesBinding     = require("./attributesBinding");

function ComponentHydrator (name, attributes, childTemplate, section, componentClass) {
  this.name           = name;
  this.attributes     = attributes;
  this.childTemplate       = childTemplate;
  this.section        = section;
  this.componentClass = componentClass;
}

module.exports = protoclass(ComponentHydrator, {
  initialize: function () {
    this.startNodePath = utils.getNodePath(this.section.start);
    this.endNodePath   = utils.getNodePath(this.section.end);
  },
  hydrate: function (view) {
    var clonedSection = createDocumentSection(view.template.nodeFactory, utils.getNodeByPath(view.node, this.startNodePath), utils.getNodeByPath(view.node, this.endNodePath));

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