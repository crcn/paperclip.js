var BaseExpression = require("./base");

function DoctypeExpression (value) {
  this.value = value;
}

BaseExpression.extend(DoctypeExpression, {
  type: "doctype"
});

module.exports = DoctypeExpression;