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

    buffer = ["').nodeBinding('#{@name}'"]

    options = []

    if @attributes
      options.push " attrs: #{@attributes.toJsString()} "

    if @children
      options.push " children: paper.create().html('#{@children.toString()}') "

    if options.length
      buffer.push ", {#{options}}"

    buffer.push ").html('"

    buffer.join("")

  ###
  ###

  toString: () ->

    return @toJsString() if @attributes?.hasBinding()

    buffer = ["<#{@name}"]

    if @attributes
      buffer.push " ", @attributes


    if @children
      buffer.push ">"
      buffer.push @children.items.join("")
      buffer.push "</#{@name}>"
    else
      buffer.push "/>"



    buffer.join("")



module.exports = NodeExpression
