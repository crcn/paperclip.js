var protoclass        = require("protoclass"),
FragmentSection       = require("../../../section/fragment"),
NodeSection           = require("../../../section/node"),
Fragment              = require("../fragment"),
utils                 = require("../../../utils"),
BindableObject        = require("bindable-object"),
script                = require("../../../script"),
ComponentHydrator     = require("./componentHydrator"),
AttributeHydrator     = require("./attributeHydrator"),
ValueAttribute        = require("./valueAttribute");

/**
 */

function Element (name, attributes, children) {
  this.name       = name;
  this.attributes = attributes;
  this.children   = children
}

/**
 */

module.exports = protoclass(Element, {
  initialize: function (template) {

    var componentClass = template.components[this.name];

    // is a component present?
    if (componentClass) {

      // create a dynamic section - this is owned by the component
      var section = new FragmentSection(template.nodeFactory);

      template.hydrators.push(new ComponentHydrator(
        this.name, 
        this.attributes, 
        template.child(this.children),
        section, 
        componentClass
      ));

      // TODO:

      /*
        return {
          createNode: function () {
            return section.render();
          }
        }
      */

      return section.render();
    }


    var element = template.nodeFactory.createElement(this.name),
    hasAttrComponent = false,
    vanillaAttrs = {};

    var elementSection;

    // components should be attachable to regular DOM elements as well
    for (var k in this.attributes) {

      var v = this.attributes[k], tov = typeof v;
      var attrComponentClass = template.components[k],
      attrClass = template.attributes[k];
      hasAttrComponent = !!attrComponentClass || hasAttrComponent;

      if (attrComponentClass) {

        if (!elementSection) {
          elementSection = new NodeSection(element);
        }

        template.hydrators.push(new ComponentHydrator(
          this.name,

          // v could be formatted as repeat.each, repeat.as. Need to check for this
          typeof v === "object" ? v : this.attributes,
          template.child(this.children),
          elementSection,
          attrComponentClass
        ));

      } else if (attrClass && (!attrClass.test || attrClass.test(v))) {
        template.hydrators.push(new AttributeHydrator(
          attrClass,
          k,
          v,
          element
        ));
      } else {

        if (tov === "string") {
          // element.setAttribute(k, v);
          vanillaAttrs[k] = v;
        } else {
          template.hydrators.push(new AttributeHydrator(
            ValueAttribute,
            k, 
            v, 
            element
          ));
        }
      }
    }


    /*
      TODO: throw node creation in another object

      return {
        createNode: function () {
          
          var element = document.createElement()
          // no component class with the attrs? append the children
          if (!hasAttrComponent) element.appendChild(this.children.initialize(template));

          return element;
        }
      }
    */


    for (var k in vanillaAttrs) {
      element.setAttribute(k, vanillaAttrs[k]);
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

  var setter = new BindableObject({a:{}});

  // check the attributes for any scripts - pluck them out
  // TODO - check for attribute components - apply the same 
  // logic as components

  // NOTE - a bit sloppy here, but we're hijacking the bindable object
  // setter functionality so we can properly get attrs for stuff like repeat.each
  for (var k in attributes) {
    var v = attributes[k];
    if (typeof v === "object") {
      setter.set("a." + k, script(v));
    } else {
      setter.set("a." + k, v);
    }
  }

  // TODO - check for registered components, 
  return new Element(name, setter.a, new Fragment(children));
} 