var BaseExpression = require("./base");

function ScriptExpression (value) {
  this.value = value;
}

BaseExpression.extend(ScriptExpression, {
  type: "script"
});

module.exports = ScriptExpression;