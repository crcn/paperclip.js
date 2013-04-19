class Evaluator

  constructor: (@expr, @context) ->


class OptionsExpression

  _type: "options"
  
  constructor: (@items) ->

  evaluate: (context) -> new Evaluator @, context



module.exports = OptionsExpression
