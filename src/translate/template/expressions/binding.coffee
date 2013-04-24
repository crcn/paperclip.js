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

  toString: () -> "this.binding(#{@script}, #{@children.join(",")})"

module.exports = Binding