class TextStringExpression extends require("./base")
  
  _type: "textString"

  ###
  ###

  constructor: (@value) ->
    super()

  ###
  ###

  toJsString: () -> 
    @value.toJsString()

  ###
  ###

  toString: () -> "#{@value}"


module.exports = TextStringExpression