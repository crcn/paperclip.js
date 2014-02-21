var BaseXMLExpression = require("./base");

function ChildNodesExpression (childNodes) {
  BaseXMLExpression.call(this);
  this.expressions = childNodes;
}

BaseXMLExpression.extend(ChildNodesExpression, {

  /**
   */

  type: "childNodes",

  /**
   */

  toJavaScript: function () {
    return "[" + this.expressions.map(function (childNode) {
      return childNode.toJavaScript();
    }).join(",") + "]";
  }
});

module.exports = ChildNodesExpression;