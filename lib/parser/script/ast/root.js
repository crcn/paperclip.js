var BaseScriptExpression = require("./base");

function RootExpression (expressions) {
  BaseScriptExpression.call(this);
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