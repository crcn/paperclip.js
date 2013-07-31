base      = require "../../base/expression"

class ModifierExpression extends base.Expression
  
  ###
  ###

  _type: "modifier"

  ###
  ###

  constructor: (@name, @params, @expression) -> 
    super()
    @addChild @params, @expression

  ###
  ###

  toString: () -> 

    # this.modify(this.modifier).value()

    buffer = []

    
    buffer.push "modifiers"
    buffer.push ".#{@name}("



    params = [@expression.toString()]


    for p in @params.items
      params.push p.toString()


    buffer.push params.join(","), ")"
    buffer.join ""

module.exports = ModifierExpression