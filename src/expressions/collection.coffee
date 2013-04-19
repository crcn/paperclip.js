base = require "./base"

class Evaluator extends base.Evaluator
  
  constructor: () ->
    super arguments...
    @items = @expr.items.map (item) => @linkChild item.evaluate(@context)

  toString: () -> @items.map((item) -> item.toString()).join(" ")

class CollectionExpression
  
  _type: "collection"

  ###
  ###

  constructor: (@items) ->


  ###
  ###

  evaluate: (context) -> new Evaluator @, context

module.exports = CollectionExpression
module.exports.Evaluator = Evaluator