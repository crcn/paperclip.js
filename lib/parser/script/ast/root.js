var BaseScriptExpression = require("./base");

function RootExpression (expressions) {
  BaseScriptExpression.apply(this, arguments);
  this.expressions = expressions;
}

BaseScriptExpression.extend(RootExpression, {

  /**
   */

  toJavaScript: function () {
    return "({" + this.expressions.map(function (expr) {
      return expr.name + ":" + expr.toJavaScript();
    }).join(",") + "})";
  }
});

module.exports = RootExpression;