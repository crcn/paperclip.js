base = require "../../base/expression"
modifiers = require "../modifiers"

class ModifierExpression extends base.Expression
  
  _type: "modifier"

  constructor: (@name, @params, @expression) -> 
    super()
    @addChild @params, @expression

  toString: () -> 



    # exists as a default modifier?
    if modifiers[@name]
      buffer = ["this.defaultModifiers."]
    else
      buffer = ["this.modifiers."]

    buffer.push "#{@name}("

    params = [@expression.toString()]

    for p in @params.items
      params.push p.toString()


    buffer.push params.join(","), ")"


    buffer.join ""

module.exports = ModifierExpression