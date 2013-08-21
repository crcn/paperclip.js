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


    if @children.items?.length
      element = "fragment([#{element}])"
    else
      console.log "\n\n\n", element

    buffer.push "function(fragment, block, element, text, modifiers){ return fragment([ #{@children} ]) }"

    buffer.join " "

module.exports = RootExpression