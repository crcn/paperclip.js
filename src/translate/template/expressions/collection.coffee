class Expression extends require("../../base/collectionExpression")
  
  toString: () -> "[#{@items.join(',')}]"

module.exports = Expression