var BaseExpression = require("./base");

function GroupExpression (expression) {
  this.expression = expression;
}

BaseExpression.extend(GroupExpression, {
  type: "call",
  toJavaScript: function () {
    return "(" + this.expression.toJavaScript() + ")";
  }
});

module.exports = GroupExpression;