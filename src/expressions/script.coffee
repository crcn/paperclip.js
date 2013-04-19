class Evaluator

  constructor: (@expr, @context) ->
    @references = @expr.references.evaluate(context)
    @modifiers  = @expr.modifiers.evaluate(context)

  ###
  ###

  toString: () -> 
    @references.toString()

class ScriptExpression


  _type: "script"

  ###
  ###

  constructor: (@references, @modifiers) ->


  ###
  ###

  evaluate: (context) -> new Evaluator @, context




module.exports = ScriptExpression