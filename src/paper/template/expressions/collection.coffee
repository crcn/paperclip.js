CollectionExpression = require "../../../base/collectionExpression"

class Expression extends CollectionExpression
  
  toString: () ->
    command = ["this"]
    for item in @items
      command.push item.toString()

    command.join(".")

module.exports = Expression