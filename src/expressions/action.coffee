class Evaluator

  constructor: (@expr, @context) ->
    @name    = @expr.name
    @options = @expr.options.evaluate @context

  toString: () -> @options.toString()


class ActionExpression
  
  _type: "action"
  
  ###
  ###

  constructor: (@name, @options) ->
    

  ###
  ###

  evaluate: (context) -> new Evaluator @, context

module.exports = ActionExpression