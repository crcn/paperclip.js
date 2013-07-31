base = require "../../base/expression"

class JSExpression extends base.Expression

  ###
  ###

  _type: "js"

  ###
  ###

  constructor: (@value) ->
    super()

  ###
  ###

  toString: () -> @value


module.exports = JSExpression

