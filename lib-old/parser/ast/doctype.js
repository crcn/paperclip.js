var BaseExpression = require("./base");

function DoctypeExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(DoctypeExpression, {
  type: "doctype",
  toJavaScript: function() {
    return "text('<!DOCTYPE " + this.value + ">')";
  }
});

module.exports = DoctypeExpression;
