base = require "../../../base/expression"
Clip = require "../../../clip"

class Expression extends base.Expression
  _type: "block"
  constructor: (@value) ->
  toString: () -> "bind(#{Clip.compile(@value.toString())})"

module.exports = Expression
