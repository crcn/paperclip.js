class TextBindingExpression extends require("./base")
  
  _type: "textBinding"
  _method: "textBinding"
  _binding: true

  ###
  ###

  constructor: (@binding) ->
    super()

  ###
  ###

  toString: () -> "'), #{@toMethodString()}, text('"

  ###
  ###

  toJsString: () -> @binding

  ###
  ###

  toMethodString: () -> "block(#{@binding})"


module.exports = TextBindingExpression