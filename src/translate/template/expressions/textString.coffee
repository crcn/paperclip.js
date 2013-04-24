class TextStringExpression extends require("./collection")
  
  _type: "textString"

  ###
  ###

  constructor: (@value) ->
    super()

  ###
  ###

  toString: () -> "#{@value}"


module.exports = TextStringExpression