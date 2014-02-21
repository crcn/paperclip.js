var BaseXMLExpression = require("./base"),
ent                   = require("ent");

function TextBlockExpression (expressions) {
  BaseXMLExpression.apply(this, arguments);
  this.expressions = expressions;
}

BaseXMLExpression.extend(TextBlockExpression, {

  /**
   */

  type: "textBlock",

  /**
   */

  toJavaScript: function () {
    return "textBlock([" + this.expressions.map(function (expr) {
      return expr.toJavaScript();
    }).join(",") + "])";
  }
});

module.exports = TextBlockExpression;