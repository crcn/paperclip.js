var BaseExpression = require("./base"),
he                 = require("he");

function TextNodeExpression(value) {
  this.value = he.decode(value);

  // FIXME:
  // will be invalid if vlaue is something like 'a'
  this.decoded = this.value !== value;
  
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TextNodeExpression, {
  type: "textNode",
  toJavaScript: function() {
    return "text(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = TextNodeExpression;
