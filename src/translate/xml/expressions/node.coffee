class NodeExpression extends require("./base")
  
  _type: "node"

  ###
  ###

  constructor: (@name, @attributes, @children) -> 
    super()

    @addChild @attributes...
    @addChild @children...


  ###
  ###

  toString: () ->
    buffer = ["this.node('#{@name}')"]

    if @attributes.length
      buffer.push @attributes.join(".")

    if @children.length
      buffer.push "children(#{@children.join(",")})"

    buffer.join(".")

module.exports = NodeExpression
