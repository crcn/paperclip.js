base = require "./base"

class StringExpression
  _type: "string"
  constructor: (@value) ->
  toString: () -> "'#{@value.replace("\'", "\\'")}'"
  references: () -> []


module.exports = StringExpression
