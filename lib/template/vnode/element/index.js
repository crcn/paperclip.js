var protoclass        = require("protoclass"),
createDocumentSection = require("document-section"),
Fragment              = require("../fragment"),
utils                 = require("../../../utils"),
BindableObject        = require("bindable-object"),
script                = require("../../../script"),
ComponentHydrator     = require("./componentHydrator");

// this is the base class for registered components

function Element (name, attributes, children) {
  this.name       = name;
  this.attributes = attributes;
  this.children   = children
}

function _bindableAttributes (attributes) {
  var b = new BindableObject();

  b.bindings = {

  };

  function _bindAttribute (key, value) {

  }

  for (var k in attributes) _bindAttribute(k, attributes[k]);

  return b;
}

module.exports = protoclass(Element, {
  initialize: function (template) {

    var componentClass = template.components[this.name];

    // is a component present?
    if (componentClass) {

      // create a dynamic section - this is owned by the component
      var section = createDocumentSection(template.nodeFactory);

      template.hydrators.push(new ComponentHydrator(
        this.name, 
        this.attributes, 
        template.child(this.children),
        section, 
        componentClass
      ));

      return section.render();
    }


    var element = template.nodeFactory.createElement(this.name),
    hasAttrComponent = false;

    // components should be attachable to regular DOM elements as well
    for (var k in this.attributes) {
      var attrComponentClass = template.components[k];
      hasAttrComponent = !!attrComponentClass || hasAttrComponent;


      if (attrComponentClass) {
        var section = createDocumentSection(template.nodeFactory);
        template.hydrators.push(new ComponentHydrator(
          this.name,
          this.attributes,
          template.child(this.children),
          section,
          attrComponentClass
        ));
        element.appendChild(section.render());
      }

    }

    // no component class with the attrs? append the children
    if (!hasAttrComponent) element.appendChild(this.children.initialize(template));

    return element;
  }
});


/*

element("video", [block()])
*/

module.exports.create = function (name, attributes, children) {

  var attrs = {};

  // check the attributes for any scripts - pluck them out
  // TODO - check for attribute components - apply the same 
  // logic as components
  for (var k in attributes) {
    var v = attributes[k];
    if (typeof v === "object") {
      attrs[k] = script(v);
    } else {
      attrs[k] = v;
    }
  }

  // TODO - check for registered components, 
  return new Element(name, attrs, new Fragment(children));
} 