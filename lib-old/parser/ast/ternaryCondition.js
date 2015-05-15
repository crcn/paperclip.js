var BaseExpression = require("./base");

function TernaryConditionExpression(condition, tExpression, fExpression) {
  this.condition = condition;
  this.tExpression = tExpression;
  this.fExpression = fExpression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TernaryConditionExpression, {
  type: "ternaryCondition",
  toJavaScript: function() {
    return this.condition.toJavaScript()  +
    "?" + this.tExpression.toJavaScript() +
    ":" + this.fExpression.toJavaScript();
  }
});

module.exports = TernaryConditionExpression;
