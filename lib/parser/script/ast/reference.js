var BaseScriptExpression = require("./base");

function ReferenceExpression (path, unbound) {
  BaseScriptExpression.call(this);
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
    return this.path.join(".");
  }
});

module.exports = ReferenceExpression;