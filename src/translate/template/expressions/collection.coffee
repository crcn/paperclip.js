class Expression extends require("../../base/collectionExpression")
  
  toString: () -> "#{@map('toString',',')}"

module.exports = Expression