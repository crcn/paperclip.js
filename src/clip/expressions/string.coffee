base = require "../../base/expression"

class StringExpression
  _type: "string"
  constructor: (@value) ->
  toString: () -> "'#{@value.replace("\'", "\\'").replace("\n","\\n")}'"


module.exports = StringExpression
