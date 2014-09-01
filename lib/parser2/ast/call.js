var BaseExpression = require("./base");

function CallExpression (reference, parameters) {
  this.reference  = reference;
  this.parameters = parameters;
}

BaseExpression.extend(CallExpression, {
  type: "call"
});

module.exports = CallExpression;