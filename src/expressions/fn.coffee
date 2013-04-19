class Evaluator
  
  ###
  ###

  constructor: (@expr, @context) ->


class FnExpression
  
  ###
  ###

  constructor: (@name, @params) ->

  ###
  ###

  eval: (context) -> new Evaluator @, context



module.exports = FnExpression