var BaseXMLExpression = require("./base");

function NodeExpression (nodeName, attributes, childNodes) {
  BaseXMLExpression.apply(this, arguments);

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
    switch(this.nodeName) {
      case "script": return this._toJsScript();
      default: return this._toJsElement();
    }
  },
  _toJsScript: function () {
    return "script(\"" + this.nodeName + "\", " + this.attributes.toJavaScript() + ", " + this.childNodes.expressions[0] + ")";
  },
  _toJsElement: function () {
    return "element(\"" + this.nodeName + "\", " + this.attributes.toJavaScript() + ", " + this.childNodes.toJavaScript() + ")";
  }
});

module.exports = NodeExpression;