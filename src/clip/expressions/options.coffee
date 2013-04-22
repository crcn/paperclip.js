base = require "../../base/expression"

class OptionsExpression extends base.Expression
  
  ###
  ###

  _type: "options"

  ###
  ###

  constructor: (@items) ->
    super()
    @addChild items


  toString: () ->
    buffer = ["{"]
    params = []


    for item in @items
      params.push "'#{item.name}':#{item.expression}"

    buffer.push params.join(","), "}"

    buffer.join ""



module.exports = OptionsExpression
