var BaseXMLExpression = require("./base");

function RootExpression (expressions) {
  BaseXMLExpression.call(this);
  this.expressions = expressions;
}

BaseXMLExpression.extend(RootExpression, {

  /**
   */

  type: "root",

  /**
   */

  toJavaScript: function () {
    var buffer = "(function (fragment, block, element, text, parser, modifiers) { ";

    var element;

    if (this.expressions.length > 1) {

      element = "fragment([" + this.expressions.map(function (expression) {
        return expression.toJavaScript();
      }).join(",") + "])";

    } else if (this.expressions.length) {
      element = this.expressions[0].toJavaScript();
    } else {
      return buffer + "})";
    }

    return buffer + "return " + element + "; })"
  }
});

module.exports = RootExpression;