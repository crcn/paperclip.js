var BaseScriptExpression = require("./base");

function GroupExpression (expressions) {
  BaseScriptExpression.call(this);
  this.expressions = expressions;
}

BaseScriptExpression.extend(GroupExpression, {

  /**
   */

  toJavaScript: function () {
    return "(" + this.expressions.map(function (expr) {
      return expr.toJavaScript();
    }).join("") + ")"; 
  }
});

module.exports = GroupExpression;