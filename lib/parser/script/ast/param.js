var BaseScriptExpression = require("./base");

function ParamExpression (expressions) {
  BaseScriptExpression.apply(this, arguments);
  this.expressions = expressions;
}

BaseScriptExpression.extend(ParamExpression, {

  /**
   */

  toJavaScript: function () {
    return this.expressions.map(function (expr) {
      return expr.toJavaScript();
    }).join("");
  }
});

module.exports = ParamExpression;