var nodeBindingFactory = require("../bindings/node/factory"),
type                   = require("type-component"),
BaseWriter             = require("./base");

function ElementWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(ElementWriter, {
  write: function (name, attributes, children) {

      if (!attributes) attributes = {};
      if (!children) children = [];

      var element = this.nodeFactory.createElement(name), attrName, value;

      for (attrName in attributes) {
          value = attributes[attrName];
          if (typeof value === "object") continue;
          element.setAttribute(attrName, value);
      }

      this.binders.push.apply(this.binders, nodeBindingFactory.getBinders({
        node        : element,
        nodeName    : name,
        application : this.application,
        attributes  : attributes
      }));

      for (var i = 0, n = children.length; i < n; i++) {
        element.appendChild(children[i]);
      }

      return element;
  }
});

module.exports = ElementWriter;
