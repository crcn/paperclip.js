class TextExpression extends require("./collection")
  
  _type: "text"

  ###
  ###

  constructor: (items) ->
    super items

  ###
  ###

  toString: () -> ["this.text()"].concat(@items).join "."


module.exports = TextExpression