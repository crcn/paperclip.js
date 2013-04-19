base = require "./base"

class Evaluator extends base.Evaluator
  
  constructor: () ->
    super arguments...


class ModifierExpression
  
  _type: "modifier"

  constructor: (@name, @params) ->

  evaluate: (context) -> new Evaluator @, context

module.exports = ModifierExpression