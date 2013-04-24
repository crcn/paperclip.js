class AttributesExpression extends require("./base")
  
  ###
  ###

  constructor: (items) ->
    super items
    @addChild items...

  ###
  ###

  toString: () ->
  
    params = []
    for attr in @_children
      params.push "'#{attr.name}':#{attr.value}"

    "{#{params.join(',')}}"

module.exports = AttributesExpression