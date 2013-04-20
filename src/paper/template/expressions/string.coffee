base = require "../../../base/expression"

class Expression extends base.Expression
  _type: "string"
  constructor: (@value) ->
  toString: () -> "push('#{@value.replace("'","\\'").replace("\n","\\n")}')"

module.exports = Expression