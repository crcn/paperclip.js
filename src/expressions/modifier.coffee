class Evaluator
  
  constructor: (@expr, @context) ->


class ModifierExpression
  
  ###
  ###

  constructor: (@name, @params) ->


  ###
  ###

  eval: (context) -> new Evaluator @, conext

module.exports = ModifierExpression