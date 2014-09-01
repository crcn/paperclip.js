var BaseExpression = require("./base");

function ElementNodeExpression (nodeName, attributes, childNodes) {
  this.name       = nodeName;
  this.attributes = attributes;
  this.childNodes = childNodes || [];
}

BaseExpression.extend(ElementNodeExpression, {
  type: "elementNode",
  toJavaScript: function () {
    return "element(\"" + this.nodeName + "\", " + this.attributes.toJavaScript() + ", " + this.childNodes.toJavaScript() + ")";
  }
});

module.exports = ElementNodeExpression;