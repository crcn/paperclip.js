var protoclass = require("protoclass"),
createDocumentSection = require("document-section"),
Fragment = require("./fragment");

// this is the base class for registered components

function Element (name, attributes, children) {
  this.name       = name;
  this.attributes = attributes;
  this.children   = children
}

module.exports = protoclass(Element, {
  initialize: function (scope) {

    // TODO - check for components
    var element = scope.nodeFactory.createElement(this.name); 
    element.appendChild(this.children.initialize(scope));
    return element;
  }
});


/*

element("video", [block()])
*/

module.exports.create = function (name, attributes, children) {

  // TODO - check for registered components, 
  return new Element(name, attributes, new Fragment(children));
} 