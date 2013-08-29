class RootExpression extends require("./base")
  
  _method: "html"

  constructor: (@children, @modExports = true) ->  
    super()
    @addChild children

  
  toString: () ->
    buffer = []

    if @modExports
      buffer.push "module.exports = "


    buffer.push "function(fragment, block, element, text, modifiers, parse){ return fragment([ #{@children} ]) }"

    buffer.join " "

module.exports = RootExpression