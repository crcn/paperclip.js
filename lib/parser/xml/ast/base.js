var BaseExpression = require("../../base/expression");

function BaseXMLExpression () {
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(BaseXMLExpression);

module.exports = BaseXMLExpression;