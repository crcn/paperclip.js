base = require "./base"

class Evaluator extends base.Evaluator

  constructor: () ->
    super arguments...
    @name    = @expr.name
    @options = @linkChild @expr.options.evaluate @clip
    @init()

  bind: (to) -> @options.bind to
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