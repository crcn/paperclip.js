var BaseExpression = require("./base");

function LiteralExpression (value) {
  this.value = value;
}

BaseExpression.extend(LiteralExpression, {
  type: "literal"
});

module.exports = LiteralExpression;