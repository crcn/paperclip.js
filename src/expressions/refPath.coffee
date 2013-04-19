CollectionExpression = require("./collection")

class Evaluator extends CollectionExpression.Evaluator
  
  # wraps something like 
  # items.size() in
  # this.ref("items.size").call()
  toString: () ->

    buffer = ["this"]
    currentChain = []

    for part in @items
      currentChain.push part.name
      if part.expr._type is "fn"
        buffer.push ".ref('", currentChain.join("."), "').call"
        buffer.push part.params.toString()
        currentChain = []

    if currentChain.length
      buffer.push ".ref('", currentChain.join("."), "')"

    buffer.join("")






  

class RefPathExpression extends CollectionExpression

  _type: "refPath"

  evaluate: (context) -> new Evaluator @, context


module.exports = RefPathExpression