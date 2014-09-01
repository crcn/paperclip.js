var BaseExpression = require("./base");

function TernaryConditionExpression (condition, tExpression, fExpression) {
  this.condition = condition;
  this.tExpression = tExpression;
  this.fExpression = fExpression;
}

BaseExpression.extend(TernaryConditionExpression, {
  type: "ternaryCondition"
});

module.exports = TernaryConditionExpression;