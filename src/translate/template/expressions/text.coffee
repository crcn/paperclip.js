class TextExpression extends require("./base")
  
  _type: "text"

  ###
  ###

  constructor: (@buffer) ->
    super()
    @addChild @buffer

  toString: () -> 
    "text(#{@buffer.items.join("")})" 


module.exports = TextExpression