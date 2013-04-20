CollectionExpression = require "./collection"

class ParamsExpression extends CollectionExpression
  _type: "params"
  toString: () ->
    @items.map((item) -> item.toString()).join(",")


module.exports = ParamsExpression