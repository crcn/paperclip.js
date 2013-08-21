class RootExpression extends require("./base")
  
  _method: "html"

  constructor: (@children, @modExports = true) ->  
    super()
    @addChild children

  
  toString: () ->
    buffer = []

    if @modExports
      buffer.push "module.exports = "



    element = "#{@children}"


    if @children.items?.length > 1
      element = "fragment([#{element}])"

    buffer.push "function(fragment, block, element, text, modifiers){ return #{element} }"

    buffer.join " "

module.exports = RootExpression