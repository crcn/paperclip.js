var BaseScriptExpression = require("./base");

function GetExpression (reference) {
  BaseScriptExpression.call(this);
  this.reference = reference;
}

BaseScriptExpression.extend(GetExpression, {

  /**
   */

  type: "reference",

  /**
   */

  toJavaScript: function () {
    return "this.get(" + this.reference.toJavaScript() + ")";
  }
});

module.exports = GetExpression;