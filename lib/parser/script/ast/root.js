var BaseScriptExpression = require("./base");

function RootExpression (expressions) {
  BaseScriptExpression.call(this);
  this.expressions = expressions;
}

BaseScriptExpression.extend(RootExpression, {

  /**
   */

  toJavaScript: function () {

    var buffer = "({";

    buffer += "s:function () { return " + this.expressions.map(function (expr) {
      return expr.toJavaScript();
    }).join("") + "; },";

    buffer += "r:[]"

    return buffer + "})";
  }
});

module.exports = RootExpression;