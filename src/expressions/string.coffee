base = require "./base"

class Evaluator extends base.Evaluator
  toString: () -> "'#{@expr.value}'"

class StringExpression
  constructor: (@value) ->

  evaluate: (clip) -> new Evaluator @, clip


module.exports = StringExpression
