var protoclass = require("protoclass"),
createDocumentSection = require("document-section");

// this is the base class for registered components

function Element (name, attributes, children) {
  this.name       = name;
  this.attributes = attributes;
  this.children   = children
}

module.exports = protoclass(Element, {
  view: function (context) {
    var clone = this.node.cloneNode();
    this.scope.initialize(context);
  },
  initialize: function (scope) {
    console.log("INIT");
  },
  initialize2: function (scope) {

    this.scope = scope;

    var componentClass, node;

    if (componentClass = scope.components[this.name]) {

      var section = createDocumentSection();

      this.children.initialize(scope.child());

      scope.addBinding({
        section: section,
        name: this.name,
        children: this.children,
        componentClass: componentClass,
        bind: function (node) {
          var component = new this.componentClass(this.name, this.children);
          var v = this.children.view(context);
          v.render();
        }
      });

      this.node = createDocumentSection();
      return;
    }


  }
});


/*

element("video", [block()])
*/

module.exports.create = function (name, attributes, children) {

  // TODO - check for registered components, 
  return new Element(name, attributes, children);
} 