ent = require("ent")

class StringExpression extends require("./base")
    
  _type: "string"
  
  ###
  ###

  constructor: (value) ->
    @value = ent.decode(value)
    super()

  ###
  ###

  toString: () -> "'#{@value.replace(/'/g,"\\'").replace(/\n/g, "\\n")}'"

  ###
  ###

  toJsString: () -> "'#{@toString()}'"


module.exports = StringExpression