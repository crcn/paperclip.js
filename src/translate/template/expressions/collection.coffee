class Expression extends require("../../base/collectionExpression")
  
  toJsString: () -> "[#{@map('toJsString',',')}]"

module.exports = Expression