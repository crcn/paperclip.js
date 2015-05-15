var BaseExpression       = require("./base");
var ParametersExpression = require("./parameters");

/**
 */

function ArrayExpression(expressions) {
  this.expressions = expressions || new ParametersExpression();
  BaseExpression.apply(this, arguments);
}

/**
 */

BaseExpression.extend(ArrayExpression, {

  /**
   */

  type: "array",

  /**
   */

  toJavaScript: function() {
    return "[" + this.expressions.toJavaScript() + "]";
  }
});

module.exports = ArrayExpression;
