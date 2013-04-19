base = require "./base"

class Evaluator extends base.Evaluator
  
  constructor: () ->
    super arguments...
    @name = @expr.name
    @params = @linkChild @expr.params.evaluate @clip

  init: () ->
    super()


  map: (value, callback) ->
    modifier = @clip.modifiers[@name]
    return value if not modifier
    params = @params.items.map (item) -> item.value()
    params.unshift value
    modifier.apply @, params





class ModifierExpression
  
  _type: "modifier"

  constructor: (@name, @params) ->

  evaluate: (context) -> new Evaluator @, context

module.exports = ModifierExpression