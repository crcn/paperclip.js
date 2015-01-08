var utils     = require("../../utils"),
ValueBinding  = require("./bindings/value"),
createScripts = require("../../script");

function addBinding (bindingClass, template, element, attrName, attrValue) {
  template.clips.push({
    attrName: attrName,
    scripts: createScripts(attrValue),
    bindingClass: bindingClass,
    element: element,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.element);
    },
    prepare: function (view) {
      var element = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new this.bindingClass(view, element, this.scripts, this.attrName));
    }
  });
}

function addBufferedBinding (template, element, key, values) {

}

module.exports = function (template) {

  var nodeFactory    = template.application.nodeFactory,
  attrBindingFactory = template.paperclip.attrBindingFactory;

  return function (name, attributes, childNodes) {

    // TODO - check here for custom component?
    // also need to figure out how to change the context of child block bindings
    // the elements could also be virtual - this would allow us the freedom to setup the DOM 
    // however we want. How do we setup marker elements though? 
    var element = nodeFactory.createElement(name);


    for (var key in attributes) {

      var value = attributes[key], bindingClass = attrBindingFactory.getClass(key, value);

      if (bindingClass || typeof value !== "string") {
        addBinding(bindingClass || ValueBinding, template, element, key, value);
      } else {  
        element.setAttribute(key, value);
      }
    }

    if (childNodes.length) {
      element.appendChild(childNodes.length > 1 ? nodeFactory.createFragment(childNodes) : childNodes[0]);
    }
    
    return element;
  };
}