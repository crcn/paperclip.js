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
      isScript = !!attr.value?.items?.filter((item) ->
        item._type is "script"
      ).length

      name = attr.name

      if isScript or name is "data-bind"
        attrValue = "[" + attr.value.toString() + "]"
      else
        attrValue = String(if attr.value then attr.value.toString() else 'true')
        if attrValue is ""
          attrValue = "''"

      params.push "'#{name}':#{attrValue}"

    "{#{params.join(',')}}"




module.exports = AttributesExpression