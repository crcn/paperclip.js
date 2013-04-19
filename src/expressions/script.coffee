base = require "./base"
events = require "events"
async = require "async"

class Evaluator extends base.Evaluator

  constructor: () ->
    super arguments...
    @_em = new events.EventEmitter()
    @modifiers  = @linkChild @expr.modifiers.evaluate @clip
    @expressions = @linkChild @expr.expressions.evaluate @clip


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

  ###
  ###

  value: () -> 

    newValue = @_evalFn()
    for modifier in @modifiers.items
      newValue = modifier.map newValue

    newValue

  ###
  ###

  _compile: () ->
    fn = eval "(function(){ return #{@expressions.toString()} })"
    @_evalFn = () => fn.call @clip

  ###
  ###

  _change: () ->
    super()

    newValue = @value()
    return if @_currentValue is newValue
    @_em.emit "change", @_currentValue = newValue



class ScriptExpression


  _type: "script"

  ###
  ###

  constructor: (@expressions, @modifiers) ->

  ###
  ###

  evaluate: (context) -> new Evaluator @, context





module.exports = ScriptExpression