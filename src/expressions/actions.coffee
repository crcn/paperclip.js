class Evaluator

  constructor: (@expr, @context) ->

class ActionsExpression
  
  ###
  ###

  constructor: (@actions) ->


  ###
  ###

  eval: (context) -> new Evaluator @, context


module.exports = ActionsExpression