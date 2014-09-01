var BaseExpression = require("./base");

function TextNodeExpression (value) {
  this.value = value;
}

BaseExpression.extend(TextNodeExpression, {
  type: "textNode"
});

module.exports = TextNodeExpression;