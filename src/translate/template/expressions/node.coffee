class NodeExpression extends require("./base")
  
  _type: "node"

  ###
  ###

  constructor: (@name, @attributes, @children) -> 
    super()

    if attributes
      @addChild @attributes
        
    if children
      @addChild @children

  ###
  ###

  toJsString: () ->

    buffer = ["element('#{@name}'"]

    options = []

    if @attributes
      buffer.push ", #{@attributes.toString()} "
    else
      buffer.push ", {}"

    if @children
      buffer.push ", [ #{@children.toString()} ] "


    buffer.push ")"


    buffer.join("")

  ###
  ###

  toString: () -> @toJsString()



module.exports = NodeExpression
