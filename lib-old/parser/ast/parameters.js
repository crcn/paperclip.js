var BaseExpression = require("./base");

function ParametersExpression(expressions) {
  this.expressions = expressions || [];
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ParametersExpression, {
  type: "parameters",
  toJavaScript: function() {
    return this.expressions.map(function(expression) {
      return expression.toJavaScript();
    }).join(", ");
  }
});

module.exports = ParametersExpression;
