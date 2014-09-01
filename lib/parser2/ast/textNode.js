var BaseExpression = require("./base"),
he                 = require("he");

function TextNodeExpression (value) {
  this.value = he.decode(value);
  this.decoded = this.value !== value;
}

BaseExpression.extend(TextNodeExpression, {
  type: "textNode",
  toJavaScript: function () {
    return "text(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = TextNodeExpression;
