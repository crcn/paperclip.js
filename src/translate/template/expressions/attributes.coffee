class AttributesExpression extends require("./collection")
  
  ###
  ###

  constructor: (items) ->
    super items

  ###
  ###

  toJsString: () ->
  
    params = []
    for attr in @_children
      params.push "'#{attr.name}':#{attr.value.toJsString()}"

    "{#{params.join(',')}}"

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
      params.push "#{attr.name}=\"#{attr.value}\""

    params.join " "




module.exports = AttributesExpression