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

  toString: () -> "').#{@toMethodString()}.text('"


  ###
  ###

  toMethodString: () -> 
    buffer = ["blockBinding(#{@script}, function(){ return paper.create().text('#{@children.toString()}')}"]

    if @childBinding
      buffer.push ", paper.create().#{@childBinding.toMethodString()}"

    buffer.push ")"

    buffer.join("")

module.exports = Binding