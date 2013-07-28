# {{binding}}
class Binding extends require("./base")

  _type: "binding"

  ###
  ###

  constructor: (@script, @children, @childBinding) ->
    super()
    @addChild @children

  ###
  ###

  toJsString: () -> "this.#{@toMethodString()}"

  ###
  ###

  toString: () -> "'), #{@toMethodString()}, text('"


  ###
  ###

  toMethodString: () -> 
    buffer = ["block(#{@script}, function(){ return text('#{@children.toString()}')}"]

    if @childBinding
      buffer.push ", function(){ return #{@childBinding.toMethodString()} }"

    buffer.push ")"

    buffer.join("")

module.exports = Binding