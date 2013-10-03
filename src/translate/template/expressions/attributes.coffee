class AttributesExpression extends require("./collection")
  
  ###
  ###

  constructor: (items) ->
    super items


  ###
  ###

  hasBinding: () ->
    for attr in @_children
      return true if attr.hasBinding()
    return false


  ###
  ###

  toString: () ->


    params = []
    for attr in @_children
      params.push "'#{attr.name}':[#{if attr.value then attr.value.toString() else 'true' }]"

    "{#{params.join(',')}}"




module.exports = AttributesExpression