CollectionExpression = require("./collection")

class Evaluator extends CollectionExpression.Evaluator
  
  # wraps something like 
  # items.size() in
  # this.ref("items.size").call()
  toString: () ->

    buffer = ["this"]
    currentChain = []

    for part in @items
      if part.expr._type is "fn"
        buffer.push ".ref('", currentChain.join("."), "').call(", part.name, "["
        buffer.push part.params.toString(), "]"
        currentChain = []
      else
        currentChain.push part.name

    if currentChain.length
      buffer.push ".ref('", currentChain.join("."), "')"

    buffer.push(".value()")

    buffer.join("")






  

class RefPathExpression extends CollectionExpression

  _type: "refPath"

  evaluate: (context) -> new Evaluator @, context


module.exports = RefPathExpression