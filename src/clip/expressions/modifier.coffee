base      = require "../../base/expression"
modifiers = require "../modifiers"

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

    if modifiers[@name]
      buffer.push "this.defaultModifiers"
    else
      buffer.push "this.modifiers"

    buffer.push ".#{@name}("



    params = [@expression.toString()]


    for p in @params.items
      params.push p.toString()


    buffer.push params.join(","), ")"
    buffer.join ""

module.exports = ModifierExpression