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

  toString: () -> "').#{@toMethodString()}.html('"

  ###
  ###

  toJsString: () -> @binding


  ###
  ###

  toMethodString: () -> "textBinding(#{@binding})"


module.exports = TextBindingExpression