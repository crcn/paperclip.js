base = require "./base"

class Evaluator extends base.Evaluator
  
  constructor: () ->
    super arguments...


class OptionsExpression

  _type: "options"
  
  constructor: (@items) ->

  evaluate: (context) -> new Evaluator @, context



module.exports = OptionsExpression
