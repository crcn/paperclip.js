var BaseScriptExpression = require("./base");

function ObjectExpression (values) {
  BaseScriptExpression.apply(this, arguments);
  this.values = values;
}

BaseScriptExpression.extend(ObjectExpression, {

  /**
   */

  toJavaScript: function () {
    var buffer = "{";
    var p = [];
    for (var key in this.values) {
      p.push("\"" + key + "\":" + this.values[key].toJavaScript());
    }

    return buffer + p.join(",") + "}";
  }
});

module.exports = ObjectExpression;