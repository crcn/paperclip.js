var BaseScriptExpression = require("./base"),
TokenCodes               = require("../tokenizer").codes;

function ReferenceExpression (path, bindType) {
  BaseScriptExpression.apply(this, arguments);
  this.path     = path;
  this.unbound  = [TokenCodes.ASSIGN, TokenCodes.TICK, TokenCodes.BT].indexOf(bindType) !== -1;
  this.bindType = bindType;
}

BaseScriptExpression.extend(ReferenceExpression, {

  /**
   */

  type: "reference",

  /**
   */

  toJavaScript: function () {
    return "[" + this.path.map(function (name) {
      return "\"" + name + "\"";
    }).join(", ") + "]";
  }
});

module.exports = ReferenceExpression;
