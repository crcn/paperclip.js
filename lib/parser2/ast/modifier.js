var BaseExpression = require("./base");

function ModifierExpression (value, reference, parameters) {
  this.value      = value;
  this.reference  = reference;
  this.parameters = parameters;
}

BaseExpression.extend(ModifierExpression, {
  type: "modifier"
});

module.exports = ModifierExpression;