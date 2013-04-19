class Evaluator

  constructor: (@expr, @context) ->
    @actions = @expr.actions.map (expr) -> expr.evaluate context

class ActionsExpression
    
  _type: "actions"

  ###
  ###

  constructor: (@actions) ->


  ###
  ###

  evaluate: (context) -> new Evaluator @, context


module.exports = ActionsExpression