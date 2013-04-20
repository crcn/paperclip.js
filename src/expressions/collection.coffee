base = require "./base"


class CollectionExpression extends base.Expression
  
  _type: "collection"

  constructor: (@items) ->
    super()
    @addChild @items...


  toString: () -> @items.map((item) -> item.toString()).join("")


module.exports = CollectionExpression