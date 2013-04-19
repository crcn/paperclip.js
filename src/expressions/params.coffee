CollectionExpression = require "./collection"

class Evaluator extends CollectionExpression.Evaluator
  
  toString: () ->
    buffer = @items.map((item) -> item.toString())
    ["(",buffer.join(","),")"].join("")

class ParamsExpression extends CollectionExpression
  
  _type: "params"

  evaluate: (context) -> new Evaluator @, context


module.exports = ParamsExpression