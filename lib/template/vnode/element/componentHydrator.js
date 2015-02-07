var protoclass        = require("protoclass");
var AttributesBinding = require("./attributesBinding");
var _extend           = require("../../../utils/extend");

/**
 */

function ComponentHydrator(name, attributes, childTemplate, section, componentClass) {
  this.name           = name;
  this.attributes     = attributes;
  this.childTemplate  = childTemplate;
  this.section        = section;
  this.componentClass = componentClass;
}

/**
 */

module.exports = protoclass(ComponentHydrator, {

  /**
   */

  initialize: function() {
    this.sectionMarker = this.section.createMarker();
  },

  /**
   */

  hydrate: function(view) {
    this.childTemplate.accessor = view.accessor;

    var clonedSection = this.sectionMarker.getSection(view.rootNode);

    // TODO - bind script attrs to these attrs
    var attributes = _extend({}, this.attributes);

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
