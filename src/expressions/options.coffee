class Evaluator

  constructor: (@expr, @context) ->


class OptionsExpression

  constructor: (@items) ->

  eval: (context) -> new Evaluator @, context



module.exports = OptionsExpression
