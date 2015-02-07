var BaseExpression = require("./base");

function ModifierExpression(name, parameters) {
  this.name  = name;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ModifierExpression, {
  type: "modifier",
  toJavaScript: function() {

    var buffer = "modifiers." + this.name + ".call(this";

    var params = this.parameters.toJavaScript();

    if (params.length) {
      buffer += ", " + params;
    }

    return buffer + ")";

  }
});

module.exports = ModifierExpression;
