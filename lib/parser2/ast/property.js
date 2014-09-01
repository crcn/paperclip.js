var BaseExpression = require("./base");

function PropertyExpression (expression, path) {
  this.context = expression;
  this.path = path;
}

BaseExpression.extend(PropertyExpression, {
  type: "property"
});

module.exports = PropertyExpression;