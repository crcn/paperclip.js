var BaseScriptExpression = require("./base");

function CallExpression (reference, params) {
  BaseScriptExpression.call(this);

  this.reference  = reference;
  this.params     = params;
}

BaseScriptExpression.extend(CallExpression, {

  /**
   */

  toJavaScript: function () {
    return ""; 
  }
});

module.exports = CallExpression;