base = require "./base"
events = require "events"

class Evaluator extends base.Evaluator

  constructor: () ->
    super arguments...
    @_em = new events.EventEmitter()
    @expressions = @linkChild @expr.expressions.evaluate @clip
    @modifiers  = @linkChild @expr.modifiers.evaluate @clip


  ###
  ###

  init: () ->
    @_compile()
    super()

  ###
  ###

  bind: (to) ->
    @_em.on "change", to
    if @_currentValue isnt undefined
      to @_currentValue

  ###
  ###

  toString: () -> 
    @expressions.toString()

  _compile: () ->
    fn = eval "(function(){ return #{@expressions.toString()} })"
    @_evalFn = () => fn.call @clip

  _change: () ->
    super()
    @_em.emit "change", @_currentValue = @_evalFn()



class ScriptExpression


  _type: "script"

  ###
  ###

  constructor: (@expressions, @modifiers) ->


  ###
  ###

  evaluate: (context) -> new Evaluator @, context





module.exports = ScriptExpression