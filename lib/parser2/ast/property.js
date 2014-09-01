var BaseExpression = require("./base");

function PropertyExpression (expression, path) {
  this.context = expression;
  this.path = path;
}

BaseExpression.extend(PropertyExpression, {
  type: "property",
  toJavaScript: function () {
    var ctx = this.context;
    if (ctx.type === "reference") { 

      // TODO - take into consideration bindings
      return "this.get(['" + this.context.value + "', " + this.path.map(function(p) { return "'"+p+"'"; }).join(', ') + "])";
    } else {
      return this.context.toJavaScript() + "." + this.path.join(".");
    }
  }
});

module.exports = PropertyExpression;