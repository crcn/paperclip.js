class Evaluator

  constructor: (@expr, @context) ->

class RefPathExpression

  ###
  ###

  constructor: (@path) ->


  eval: (context) -> new Evaluator @, context


module.exports = RefPathExpression