var BaseScriptExpression = require("./base");

function ModifierExpression (name, reference, params) {
  BaseScriptExpression.call(this);

  this.name       = name;
  this.reference  = reference;
  this.params     = params;
}

BaseScriptExpression.extend(ModifierExpression, {

  /**
   */

  toJavaScript: function () {
    return ""; 
  }
});

module.exports = ModifierExpression;