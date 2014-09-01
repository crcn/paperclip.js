var BaseExpression = require("./base");

function HashExpression (values) {
  this.value = values;
}

BaseExpression.extend(HashExpression, {
  type: "hash"
});

module.exports = HashExpression;