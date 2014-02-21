var BaseScriptExpression = require("./base");

function RootExpression (name, expression) {
  BaseScriptExpression.call(this);
  this.name = name;
  this.expression = expression;
}

BaseScriptExpression.extend(RootExpression, {

  /**
   */

  toJavaScript: function () {

    var buffer = "[";

    buffer += "function () { return " + this.expression.toJavaScript() + "; }";

    buffer += ", []"

    return buffer + "]";
  }
});

module.exports = RootExpression;