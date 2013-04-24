class TextBindingExpression extends require("./collection")
  
  _type: "textBinding"

  ###
  ###

  constructor: (@binding) ->
    super()

  ###
  ###

  toString: () -> "#{@binding}"


module.exports = TextBindingExpression