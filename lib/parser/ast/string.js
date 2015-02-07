var BaseExpression = require("./base");

function StringExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(StringExpression, {
  type: "string",
  toJavaScript: function() {
    return "\"" + this.value.replace(/"/g, "\\\"") + "\"";
  }
});

module.exports = StringExpression;
