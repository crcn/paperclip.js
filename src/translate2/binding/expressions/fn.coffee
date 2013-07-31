base = require "../../base/expression"

class FnExpression extends base.Expression
  
  ###
  ###
  
  _type: "fn"

  ###
  ###

  constructor: (@name, @params) ->
    super()
    @addChild @params

  ###
  ###

  toString: () -> @name

module.exports = FnExpression