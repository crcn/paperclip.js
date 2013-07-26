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

    buffer = ["'), element('#{@name}'"]

    options = []

    if @attributes
      buffer.push ", #{@attributes.toJsString()} "
    else
      buffer.push ", {}"

    if @children
      buffer.push ", [ text('#{@children.toString()}') ] "


    buffer.push "), text('"


    buffer.join("")

  ###
  ###

  toString: () -> @toJsString()



module.exports = NodeExpression
