var BaseExpression = require("./base");

function RootExpression (children) {
  this.childNodes = children;
}

BaseExpression.extend(RootExpression, {
  type: "rootNode",
  toJavaScript: function () {

    var buffer = "(function (fragment, block, element, text, textBlock, parser, modifiers) { ";

    var element;

    if (this.childNodes.length > 1) {

      element = "fragment([" + this.childNodes.map(function (childNode) {
        return childNode.toJavaScript();
      }).join(",") + "])";

    } else if (this.childNodes.length) {
      element = this.childNodes[0].toJavaScript();
    } else {
      return buffer + "})";
    }

    return buffer + "return " + element + "; })"
  }
});

module.exports = RootExpression;