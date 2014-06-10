var BaseScriptExpression = require("./base"),
TokenCodes = require("../tokenizer").codes;

function GetExpression (reference) {
  BaseScriptExpression.apply(this, arguments);
  this.reference = reference;
}

BaseScriptExpression.extend(GetExpression, {

  /**
   */

  toJavaScript: function () {

    if (~[TokenCodes.BT, TokenCodes.BFT, TokenCodes.BF].indexOf(this.reference.bindType)) {
      return "this.bindTo(" + this.reference.toJavaScript() + ", "+(this.reference.bindType !== TokenCodes.BF)+")";
    }

    return "this.get(" + this.reference.toJavaScript() + ")";
  }
});

module.exports = GetExpression;
