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

  toString: () ->

    buffer = ["this.node('#{@name}' "]

    options = []

    if @attributes
      options.push " attrs: #{@attributes} "

    if @children
      options.push " children: #{@children} "

    if options.length
      buffer.push ", {#{options}}"

    buffer.push ")"

    buffer.join("")

module.exports = NodeExpression
