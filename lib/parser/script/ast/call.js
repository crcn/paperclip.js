var BaseScriptExpression = require("./base");

function CallExpression (reference, params) {
  BaseScriptExpression.apply(this, arguments);

  this.reference  = reference;
  this.params     = params;
}

BaseScriptExpression.extend(CallExpression, {

  /**
   */

  toJavaScript: function () {


    var path = this.reference.path,
    fnName   = path.pop();

    var buffer = "this.call(";

    if (path.length) {
      buffer += "this.get([" + path.map(function (name) {
        return "\"" + name + "\"";
      }).join(",") + "])"
    } else {
      buffer += "this.__context"
    }

    buffer += ", \"" + fnName + "\"";

    buffer += ", [" + this.params.map(function (expr) {
      return expr.toJavaScript();
    }) + "]"

    return buffer + ")"
  }
});

module.exports = CallExpression;