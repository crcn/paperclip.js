var BaseScriptExpression = require("./base");

function ReferenceExpression (path, unbound) {
  BaseScriptExpression.apply(this, arguments);
  this.path    = path;
  this.unbound = unbound;
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