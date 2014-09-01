var BaseExpression = require("./base");

function OperatorExpression (operator, left, right) {
  this.operator = operator;
  this.left     = left;
  this.right    = right;
}

BaseExpression.extend(OperatorExpression, {
  type: "operator"
});

module.exports = OperatorExpression;