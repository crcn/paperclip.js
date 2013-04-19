base = require "./base"

class Evaluator extends base.Evaluator
  
  ###
  ###

  constructor: () ->
    super arguments...
    @name   = @expr.name
    @params = @linkChild @expr.params.evaluate @clip


class FnExpression

  _type: "fn"
  
  ###
  ###

  constructor: (@name, @params) ->

  ###
  ###

  evaluate: (context) -> new Evaluator @, context



module.exports = FnExpression