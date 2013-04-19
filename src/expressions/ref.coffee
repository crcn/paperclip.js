base = require "./base"

class Evaluator extends base.Evaluator
  
  constructor: () ->
    super arguments...
    @name = @expr.name

  toString: () -> @name

class RefExpression

  _type: "ref"

  constructor: (@name) ->

  evaluate: (context) -> new Evaluator @, context
  

module.exports = RefExpression