class TextExpression extends require("./base")
  
  _type: "text"

  ###
  ###

  constructor: (@buffer) ->
    super()
    @addChild @buffer

  ###
  ###

  toString: () -> "this.text(#{@buffer})"


module.exports = TextExpression