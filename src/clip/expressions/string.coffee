base = require "../../base/expression"

class StringExpression
  _type: "string"
  constructor: (@value) ->
  toString: () -> "'#{@value.replace(/\'/g, "\\'").replace(/\n/g,"\\n")}'"


module.exports = StringExpression
