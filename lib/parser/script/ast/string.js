var BaseScriptExpression = require("./base");

function StringExpression (value) {
  BaseScriptExpression.apply(this, arguments);
  this.value = value;
}

BaseScriptExpression.extend(StringExpression, {

  /**
   */

  toJavaScript: function () {
    return "\"" + this.value.replace(/"/g, "\\\"") + "\"";
  }
});

module.exports = StringExpression;