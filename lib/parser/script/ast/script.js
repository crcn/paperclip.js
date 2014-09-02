var BaseScriptExpression = require("./base"),
_ = require("underscore");

function RootExpression (name, expression) {
  BaseScriptExpression.apply(this, arguments);
  this.name = name;
  this.expression = expression;
}

BaseScriptExpression.extend(RootExpression, {

  /**
   */

  toJavaScript: function () {

    var refs = this.filterAllChildren(function (child) {
      return child.type === "reference";
    }).filter(function (reference) {
      return !reference.unbound && reference.path;
    }).map(function (reference) {
      return reference.path;
    });

    // remove duplicate references
    refs = _.uniq(refs.map(function (ref) {
      return ref.join(".")
    })).map(function (ref) {
      return ref.split(".");
    })

    var buffer = "{";

    buffer += "run: function () { return " + this.expression.toJavaScript() + "; }";

    buffer += ", refs: " + JSON.stringify(refs)

    return buffer + "}";
  }
});

module.exports = RootExpression;
