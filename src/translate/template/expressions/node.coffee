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
      options.push " attrs: #{@attributes.toJsString()} "

    if @children
      options.push " children: [ text('#{@children.toString()}') ] "

    if options.length
      buffer.push ", {#{options}}"

    buffer.push "), text('"

    buffer.join("")

  ###
  ###

  toString: () -> @toJsString()



module.exports = NodeExpression
