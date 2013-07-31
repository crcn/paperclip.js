class TextExpression extends require("./base")
  
  _type: "text"

  ###
  ###

  constructor: (@buffer) ->
    super()
    @addChild @buffer

  ###
  ###

  toJsString: () -> "text(#{@buffer})"

  toString: () -> 
    @buffer.items.join("")


module.exports = TextExpression