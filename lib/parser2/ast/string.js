var BaseExpression = require("./base");

function StringExpression (value) {
  this.value = value;
}

BaseExpression.extend(StringExpression, {
  type: "string"
});

module.exports = StringExpression;