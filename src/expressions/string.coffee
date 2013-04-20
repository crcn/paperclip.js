base = require "./base"

class StringExpression
  constructor: (@value) ->
  toString: () -> "'#{@value}'"
  references: () -> []


module.exports = StringExpression
