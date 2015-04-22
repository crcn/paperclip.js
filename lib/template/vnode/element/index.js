var protoclass        = require("protoclass");
var FragmentSection   = require("../../../section/fragment");
var NodeSection       = require("../../../section/node");
var Fragment          = require("../fragment");
var utils             = require("../../../utils");
var script            = require("../../../script");
var ComponentHydrator = require("./componentHydrator");
var AttributeHydrator = require("./attributeHydrator");
var ValueAttribute    = require("./valueAttribute");
var _set              = require("../../../utils/set");

/**
 */

function _replaceDashes(k) {
  return k.replace(/\-./, function(k) {
    return k.substr(1).toUpperCase();
  });
}

/**
 */

function Element(name, attributes, children) {
  this.name       = _replaceDashes(name);
  this.attributes = attributes;
  this.children   = children;
}

/**
 */

module.exports = protoclass(Element, {

  /**
   */

  initialize: function(template) {

    var componentClass = template.components[this.name];

    // is a component present?
    if (componentClass) {

      // create a dynamic section - this is owned by the component
      var section = new FragmentSection(template.document);

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
          createNode: function() {
            return section.render();
          }
        }
      */

      return section.render();
    }

    var element          = template.document.createElement(this.name);
    var hasAttrComponent = false;
    var vanillaAttrs     = {};
    var elementSection;
    var v;

    // components should be attachable to regular DOM elements as well
    for (var k in this.attributes) {

      var k2                 = _replaceDashes(k);
      v                      = this.attributes[k];
      var tov                = typeof v;
      var attrComponentClass = template.components[k2];
      var attrClass          = template.attributes[k2];

      hasAttrComponent = !!attrComponentClass || hasAttrComponent;

      if (attrComponentClass) {

        // TODO - element might need to be a sub view
        if (!elementSection) {
          elementSection = new NodeSection(template.document, element);
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

        if (tov !== "object") {
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
        createNode: function() {

          var element = document.createElement()
          // no component class with the attrs? append the children
          if (!hasAttrComponent) element.appendChild(this.children.initialize(template));

          return element;
        }
      }
    */

    for (k in vanillaAttrs) {
      v = vanillaAttrs[k];
      if (typeof v === "string") {
        element.setAttribute(k, vanillaAttrs[k]);
      }
    }

    // no component class with the attrs? append the children
    if (!hasAttrComponent) element.appendChild(this.children.initialize(template));

    return element;
  }
});

module.exports.create = function(name, attributes, children) {

  // check the attributes for any scripts - pluck them out
  // TODO - check for attribute components - apply the same
  // logic as components

  var attrs = {};

  // NOTE - a bit sloppy here, but we're hijacking the bindable object
  // setter functionality so we can properly get attrs for stuff like repeat.each
  for (var k in attributes) {
    var v = attributes[k];
    _set(attrs, k.toLowerCase(), typeof v === "object" ? script(v) : v);
  }

  // TODO - check for registered components,
  return new Element(name, attrs, new Fragment(children));
};
