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

    var buffer = "this.call(" + this.reference.toJavaScript();

    if (this.params.length) {
      buffer += "," + this.params.map(function (expr) {
        return expr.toJavaScript();
      }).join(",");
    }

    return buffer + ")"
  }
});

module.exports = CallExpression;