class Evaluator
  
  constructor: (@expr, @context) ->
    @name = @expr.name

  toString: () -> @name

class RefExpression

  _type: "ref"

  constructor: (@name) ->

  evaluate: (context) -> new Evaluator @, context
  

module.exports = RefExpression