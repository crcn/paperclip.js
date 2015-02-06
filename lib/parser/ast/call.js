var BaseExpression = require("./base");

function CallExpression(reference, parameters) {
  this.reference  = reference;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CallExpression, {
  type: "call",
  toJavaScript: function() {

    var path = this.reference.path.concat();

    var buffer = "this.call(";

    buffer += "[" + path.map(function(name) {
      return "\"" + name + "\"";
    }).join(",") + "]";

    buffer += ", [" + this.parameters.toJavaScript() + "]";

    return buffer + ")";
  }
});

module.exports = CallExpression;
