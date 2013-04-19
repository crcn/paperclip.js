class Evaluator
  
  ###
  ###

  constructor: (@expr, @context) ->
    @name   = expr.name
    @params = @expr.params.evaluate()


class FnExpression

  _type: "fn"
  
  ###
  ###

  constructor: (@name, @params) ->

  ###
  ###

  evaluate: (context) -> new Evaluator @, context



module.exports = FnExpression