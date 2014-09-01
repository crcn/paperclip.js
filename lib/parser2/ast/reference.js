var BaseExpression = require("./base");

function ReferenceExpression (value, bindingType) {
  this.value       = value;
  this.bindingType = bindingType;
}

BaseExpression.extend(ReferenceExpression, {
  type: "reference"
});

module.exports = ReferenceExpression;