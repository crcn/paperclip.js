base = require "./expression"

class CollectionExpression extends base.Expression
  
  ###
  ###

  _type: "collection"

  ###
  ###

  constructor: (@items) ->
    super()
    @addChild @items...

  ###
  ###

  toString: () -> @map "toString", ""

  ###
  ###

  map: (method, join = "") ->
    @items.map((item) -> item[method].call(item)).join join


module.exports = CollectionExpression