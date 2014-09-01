var BaseExpression = require("./base");

function LiteralExpression (value) {
  this.value = value;
}

BaseExpression.extend(LiteralExpression, {
  type: "literal",
  toJavaScript: function () {
    return String(this.value);
  }
});

module.exports = LiteralExpression;