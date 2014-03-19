var BaseExpression = require("../../base/expression");

function BaseScriptExpression () {
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(BaseScriptExpression, {
});

module.exports = BaseScriptExpression;