class TextBindingExpression extends require("./collection")
  
  _type: "textBinding"
  
  ###
  ###

  constructor: (@binding) ->
    super()

  ###
  ###

  toString: () -> "pushBinding(#{@binding})"


module.exports = TextBindingExpression