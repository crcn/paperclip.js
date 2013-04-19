class Evaluator
  
  constructor: (@expr, @context) ->


class ModifierExpression
  
  _type: "modifier"

  constructor: (@name, @params) ->

  evaluate: (context) -> new Evaluator @, context

module.exports = ModifierExpression