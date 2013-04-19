base = require "./base"
events = require "events"

class Evaluator extends base.Evaluator

  constructor: () ->
    super arguments...
    @_em = new events.EventEmitter()
    @name    = @expr.name
    @options = @linkChild @expr.options.evaluate @clip
    @init()

  bind: (to) ->
    @_em.on "change", to
    if @_currentValue isnt undefined
      to @_currentValue

  init: () ->
    @_compile()
    super()

  toString: () -> @options.toString()

  _evaluate: () ->

  _compile: () ->
    fn = eval "(function(){ return #{@toString()} })"
    @_evalFn = () => fn.call @clip

  _change: () ->
    super()
    @_em.emit "change", @_currentValue = @_evalFn()


class ActionExpression
  
  _type: "action"

  ###
  ###

  constructor: (@name, @options) ->
    

  ###
  ###

  evaluate: (context) -> new Evaluator @, context

module.exports = ActionExpression