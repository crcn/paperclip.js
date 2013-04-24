class RootExpression extends require("./node")

  constructor: (children) ->  
    super "root", null, children

  toString: () ->
    "module.exports = function(){ return #{super()} }"

module.exports = RootExpression