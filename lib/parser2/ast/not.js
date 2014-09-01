var BaseExpression = require("./base");

function NotExpression (value) {
  this.value = value;
}

BaseExpression.extend(NotExpression, {
  type: "!"
});

module.exports = NotExpression;