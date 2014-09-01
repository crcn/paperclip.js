var BaseExpression = require("./base");

function NotExpression (expression) {
  this.expression = expression;
}

BaseExpression.extend(NotExpression, {
  type: "!",
  toJavaScript: function () {
    return "!" + this.expression.toJavaScript();
  }
});

module.exports = NotExpression;