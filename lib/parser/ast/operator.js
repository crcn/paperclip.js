var BaseExpression = require("./base");

function OperatorExpression(operator, left, right) {
  this.operator = operator;
  this.left     = left;
  this.right    = right;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(OperatorExpression, {
  type: "operator",
  toJavaScript: function() {
    return this.left.toJavaScript() + this.operator + this.right.toJavaScript();
  }
});

module.exports = OperatorExpression;
