# {{binding}}
RootExpression = require "./root"

class Binding extends require("./base")

  _type: "binding"

  ###
  ###

  constructor: (@script, children, childBinding) ->
    super()

    @children = new RootExpression children, false

    if childBinding
      @childBinding = new RootExpression childBinding, false

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
    buffer = ["block(#{@script}, #{@children.toString()}"]

    if @childBinding
      buffer.push ", function(){ return #{@childBinding.toString()} }"

    buffer.push ")"

    buffer.join("")

module.exports = Binding