var utils    = require("../../utils"),
ValueBinding = require("./bindings/value"),
createScript = require("../../script");

function addBinding (attrBindingFactory, template, element, attrName, attrValue) {

  template.clips.push({
    attrName: attrName,
    script: createScript(attrValue),
    element: element,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.element);
      this.bindingClass = attrBindingFactory.getClass(attrName) || ValueBinding;
    },
    prepare: function (view) {
      var element = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new this.bindingClass(view, element, this.script, this.attrName));
    }
  });

}

function addBufferedBinding (template, element, key, values) {

}

module.exports = function (template) {

  var nodeFactory    = template.application.nodeFactory,
  attrBindingFactory = template.paperclip.attrBindingFactory;

  return function (name, attributes, childNodes) {
    var element = nodeFactory.createElement(name);

    for (var key in attributes) {

      var value = attributes[key];

      // if the value is a vanilla string, then just set the attribute
      if (typeof value === "string") {
        element.setAttribute(key, value);

      // otherwise, there's a data-binding in there somewhere. Needs
      // to get set later on
      } else {
        addBinding(attrBindingFactory, template, element, key, value);
      }

    }

    if (childNodes.length) {
      element.appendChild(childNodes.length > 1 ? nodeFactory.createFragment(childNodes) : childNodes[0]);
    }
    
    return element;
  };
}