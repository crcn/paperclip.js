base = require "../../base/expression"

class OptionsExpression extends base.Expression
  
  ###
  ###

  _type: "options"

  ###
  ###

  constructor: (@items) ->
    super()
    @addChild items...


  toString: () -> "{#{@items.join(",")}}"



module.exports = OptionsExpression
