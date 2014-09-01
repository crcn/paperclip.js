var BaseExpression = require("./base");

function AssignmentExpression (reference, value) {
  this.reference = reference;
  this.value     = value;
}

BaseExpression.extend(AssignmentExpression, {
  type: "assignment"
});

module.exports = AssignmentExpression;