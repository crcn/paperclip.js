var BaseScriptExpression = require("./base");

function GetExpression (reference) {
  BaseScriptExpression.apply(this, arguments);
  this.reference = reference;
}

BaseScriptExpression.extend(GetExpression, {
  
  /**
   */

  toJavaScript: function () {
    return "this.get(" + this.reference.toJavaScript() + ")";
  }
});

module.exports = GetExpression;