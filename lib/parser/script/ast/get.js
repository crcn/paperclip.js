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

    if (~[TokenCodes.BT, TokenCodes.BFT].indexOf(this.reference.bindType)) {
      return "this.bindTo(" + this.reference.toJavaScript() + ")";
    }

    return "this.get(" + this.reference.toJavaScript() + ")";
  }
});

module.exports = GetExpression;
