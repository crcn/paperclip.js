class AttributesExpression extends require("./collection")
  
  _type: "attributes"

  ###
  ###

  constructor: (items) ->
    super items


  ###
  ###

  toString: () ->
    buffer = []
    for attr in @items  
      buffer.push attr
    buffer.join(".")

module.exports = AttributesExpression

