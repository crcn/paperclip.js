class Evaluator

  ###
  ###

  constructor: (@expr, @context) ->


  ###
  ###

  toString: () -> @expr.value


class JSExpression

  _type: "js"

  ###
  ###

  constructor: (@value) ->


  ###
  ###

  evaluate: (context) -> new Evaluator @, context


module.exports = JSExpression

