base = require "./base"

class Evaluator extends base.Evaluator

  constructor: () ->
    super arguments...
    @references = @linkChild @expr.references.evaluate @clip
    @modifiers  = @linkChild @expr.modifiers.evaluate @clip

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