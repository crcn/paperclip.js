class StringExpression extends require("./base")
    
  _type: "string"
  
  ###
  ###

  constructor: (@value) ->
    super()

  ###
  ###

  toString: () -> "parse('#{@value.replace(/'/g,"\\'").replace(/\n/g, "\\n")}')"


module.exports = StringExpression