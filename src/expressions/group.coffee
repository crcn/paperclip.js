ParamsExpression = require "./params"

class GroupExpresion extends ParamsExpression
  toString: () -> "(#{super()})"

module.exports = GroupExpresion