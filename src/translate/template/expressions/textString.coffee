class TextStringExpression extends require("./base")
  
  _type: "textString"

  ###
  ###

  constructor: (@value) ->
    super()

  ###
  ###
  
  toString: () -> "text(#{@value})" 


module.exports = TextStringExpression