var BaseExpression = require("./base");

function ElementNodeExpression (nodeName, attributes, childNodes) {
  this.name       = nodeName;
  this.attributes = attributes;
  this.childNodes = childNodes;
}

BaseExpression.extend(ElementNodeExpression, {
  type: "elementNode"
});

module.exports = ElementNodeExpression;