base = require "./base"

class Evaluator extends base.Evaluator

  constructor: () ->
    super arguments...
    @name    = @expr.name
    @options = @linkChild @expr.options.evaluate @clip
    @init()

  bind: (to) ->

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
    console.log @_evalFn()


class ActionExpression
  
  _type: "action"

  ###
  ###

  constructor: (@name, @options) ->
    

  ###
  ###

  evaluate: (context) -> new Evaluator @, context

module.exports = ActionExpression