var BaseExpression = require("./base");

function DoctypeExpression (value) {
  this.value = value;
}

BaseExpression.extend(DoctypeExpression, {
  type: "doctype",
  toJavaScript: function () {
    return "text('<!DOCTYPE " + this.value + ">')"
  }
});

module.exports = DoctypeExpression;