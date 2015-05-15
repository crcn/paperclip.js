var BaseExpression = require("./base");

function GroupExpression(expression) {
  this.expression = expression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(GroupExpression, {
  type: "call",
  toJavaScript: function() {
    return "(" + this.expression.toJavaScript() + ")";
  }
});

module.exports = GroupExpression;
