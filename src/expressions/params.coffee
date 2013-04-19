CollectionExpression = require "./collection"

class Evaluator extends CollectionExpression.Evaluator

  value: () ->
    console.log "VALUE"
  
  toString: () ->
    buffer = @items.map((item) -> item.toString())
    buffer.join(",")

class ParamsExpression extends CollectionExpression
  
  _type: "params"

  evaluate: (context) -> new Evaluator @, context


module.exports = ParamsExpression