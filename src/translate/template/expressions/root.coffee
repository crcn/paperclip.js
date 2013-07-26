class RootExpression extends require("./base")
  
  _method: "html"

  constructor: (@children) ->  
    super()
    @addChild children

  
  toString: () ->
    "module.exports = function(block, element, text, modifiers){ return [ text('#{@children}') ] }"

module.exports = RootExpression