base = require "./base"

class StringExpression
  constructor: (@value) ->
  toString: () -> "'#{@value.replace("\'", "\\'")}'"
  references: () -> []


module.exports = StringExpression
