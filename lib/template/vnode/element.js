var protoclass        = require("protoclass"),
createDocumentSection = require("document-section"),
Fragment              = require("./fragment"),
utils                 = require("../../utils");

// this is the base class for registered components

function Element (name, attributes, children) {
  this.name       = name;
  this.attributes = attributes;
  this.children   = children
}

module.exports = protoclass(Element, {
  initialize: function (template) {

    var componentClass = template.components[this.name];

    if (componentClass) {

      var section = createDocumentSection();

      template.hydrators.push({
        section: section,
        componentClass: componentClass,
        name: this.name,
        attributes: this.attributes,
        children: template.child(this.children),
        initialize: function () {
          this.startNodePath = utils.getNodePath(this.section.start);
          this.endNodePath   = utils.getNodePath(this.section.end);
        },
        hydrate: function (view) {
          var clonedSection = createDocumentSection(void 0, utils.getNodeByPath(view.node, this.startNodePath), utils.getNodeByPath(view.node, this.endNodePath));
          var component     = new componentClass(this.name,  this.attributes, this.children, view);
          view.bindings.push(component);
          clonedSection.appendChild(component.render());
        }
      });

      return section.render();
    }


    // TODO - check for components
    var element = template.nodeFactory.createElement(this.name); 
    element.appendChild(this.children.initialize(template));
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