class TextStringExpression extends require("./collection")
  
  _type: "textString"

  ###
  ###

  constructor: (@value) ->
    super()

  ###
  ###

  toString: () -> "pushString(#{@value})"


module.exports = TextStringExpression