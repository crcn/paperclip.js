var BaseExpression = require("./base"),
ArrayExpression    = require("./array");

function ElementNodeExpression (nodeName, attributes, childNodes) {
  this.name       = nodeName;
  this.attributes = attributes;
  this.childNodes = childNodes || new ArrayExpression();
}

BaseExpression.extend(ElementNodeExpression, {
  type: "elementNode",
  toJavaScript: function () {
    return "element(\"" + this.name + "\", " + this.attributes.toJavaScript() + ", " + this.childNodes.toJavaScript() + ")";
  }
});

module.exports = ElementNodeExpression;