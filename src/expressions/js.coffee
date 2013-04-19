class Evaluator

  ###
  ###

  constructor: (@expr) ->


  init: () ->

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

  evaluate: () -> new Evaluator @


module.exports = JSExpression

