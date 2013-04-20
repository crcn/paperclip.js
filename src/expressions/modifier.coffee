base = require "./base"

class ModifierExpression extends base.Expression
  
  _type: "modifier"

  constructor: (@name, @params, @expression) -> 
    super()
    @addChild @params, @expression

  toString: () -> 
    buffer = ["this.modifiers.#{@name}("]

    params = [@expression.toString()]

    for p in @params.items
      params.push p.toString()


    buffer.push params.join(","), ")"


    buffer.join ""

module.exports = ModifierExpression