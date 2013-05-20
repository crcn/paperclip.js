base = require "../../base/expression"

class OptionExpression extends base.Expression
  
  ###
  ###

  _type: "option"

  ###
  ###

  constructor: (@name, @expression) ->
    super()
    @addChild expression


  toString: () -> "'#{@name}':#{@expression}"



module.exports = OptionExpression
