var BaseXMLExpression = require("./base");

function NodeExpression (nodeName, attributes, childNodes) {
  BaseXMLExpression.call(this);

  this.nodeName    = nodeName;
  this.attributes  = attributes;
  this.childNodes  = childNodes;
}

BaseXMLExpression.extend(NodeExpression, {

  /**
   */

  type: "node",

  /**
   */

  toJavaScript: function () {
    return "element(\"" + this.nodeName + "\", " + this.attributes.toJavaScript() + ", " + this.childNodes.toJavaScript() + ")";
  }
});

module.exports = NodeExpression;