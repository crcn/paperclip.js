var BaseScriptExpression = require("./base");

function RootExpression (name, expression) {
  BaseScriptExpression.apply(this, arguments);
  this.name = name;
  this.expression = expression;
}

BaseScriptExpression.extend(RootExpression, {

  /**
   */

  toJavaScript: function () {

    var refs = this._filterAllChildren(function (child) {
      return child.type === "reference";
    }).filter(function (reference) {
      return !reference.unbound && reference.path;
    }).map(function (reference) {
      return reference.path;
    })

    var buffer = "[";

    buffer += "function () { return " + this.expression.toJavaScript() + "; }";

    buffer += ", " + JSON.stringify(refs)

    return buffer + "]";
  }
});

module.exports = RootExpression;