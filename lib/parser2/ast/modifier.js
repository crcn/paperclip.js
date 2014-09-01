var BaseExpression = require("./base");

function ModifierExpression (reference, parameters) {
  this.reference  = reference;
  this.parameters = parameters;
}

BaseExpression.extend(ModifierExpression, {
  type: "modifier",
  toJavaScript: function () {
    return this.reference.toJavaScript() + "(" + this.parameters.toJavaScript() + ")";
  }
});

module.exports = ModifierExpression;