class Evaluator
  
  constructor: (@expr, @context) ->
    @items = @expr.items.map (item) -> item.evaluate(context)

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