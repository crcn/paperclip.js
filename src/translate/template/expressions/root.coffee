class RootExpression extends require("./base")
  
  _method: "html"

  constructor: (@children) ->  
    super()
    @addChild children

  
  toString: () ->
    "module.exports = function(fragment, block, element, text, modifiers){ return fragment([ text('#{@children}') ]) }"

module.exports = RootExpression