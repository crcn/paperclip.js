class TextExpression extends require("./base")
  
  _type: "text"

  ###
  ###

  constructor: (@buffer) ->
    super()
    @addChild @buffer

  ###
  ###

  toJsString: () -> "this.text(#{@buffer})"

  toString: () -> 
    @buffer.items.join("")


module.exports = TextExpression