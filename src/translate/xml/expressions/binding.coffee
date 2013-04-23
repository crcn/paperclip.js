# {{binding}}
class Binding extends require("./base")

  _type: "binding"

  ###
  ###

  constructor: (@script, @children) ->
    super()
    @addChild @children...

  ###
  ###

  toString: () ->   
    buffer = ["pushBinding(#{@script})"]
    if @children.length
      buffer.push "children(#{@children.join(",")})"

    buffer.join(".")

module.exports = Binding