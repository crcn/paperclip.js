class Evaluator
  
  constructor: (@expr, @context) ->

class RefExpression

  ###
  ###

  constructor: (@name) ->

  ###
  ###

  eval: (context) -> new Evaluator @, context
  

module.exports = RefExpression