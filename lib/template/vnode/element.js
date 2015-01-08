var protoclass = require("protoclass")

// this is the base class for registered components

function Element (template, name, attributes, children) {
  this.template   = template;
  this.name       = name;
  this.attributes = attributes;
  this.children   = children
}

module.exports = protoclass(Element, {
});

module.exports.create = function (template, name, attributes, children) {

  // TODO - check for registered components, 
  return new Element(template, name, attributes, children);
} 