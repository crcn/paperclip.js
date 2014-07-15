var BaseScriptExpression = require("./base");

function ModifierExpression (name, reference, params) {
  BaseScriptExpression.apply(this, arguments);

  this.name       = name;
  this.reference  = reference;
  this.params     = params;
}

BaseScriptExpression.extend(ModifierExpression, {

  /**
   */

  toJavaScript: function () {

    var buffer = "modifiers." + this.name + ".call(this, " + this.reference.toJavaScript();

    if (this.params.length) {
      buffer += "," + this.params.map(function (expr) {
        return expr.toJavaScript();
      }).join(",");
    }
  
    return buffer + ")";
  }
});

module.exports = ModifierExpression;