var BaseExpression = require("./base");

function CallExpression (reference, parameters) {
  this.reference  = reference;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CallExpression, {
  type: "call",
  toJavaScript: function () {

    var path = this.reference.path.concat(),
    fnName   = path.pop();

    var buffer = "this.call(";

    if (path.length) {
      buffer += "[" + path.map(function (name) {
        return "\"" + name + "\"";
      }).join(",") + "]"
    } else {
      buffer += "void 0"
    }


    buffer += ", \"" + fnName + "\"";

    buffer += ", [" + this.parameters.toJavaScript() + "]"

    return buffer + ")"
  }
});

module.exports = CallExpression;