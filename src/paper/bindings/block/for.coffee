type = require "type-component"

# HTML section for 
class ForDecor extends require("./base")
    
  ###
  ###

  _clone: (obj) ->
    if not obj? or typeof obj isnt 'object'
      return obj
    newInstance = new obj.constructor()

    for key of obj
      newInstance[key] = clone obj[key]
    return newInstance

  ###
  ###

  _onChange: (value, oldValue) ->
    childNodes = []

    @section.removeAll()
    for key of value
      subContext = @_clone(context)
      subContext.key = key
      subContext.value = value[key]

      child = @contentTemplate.bind(subContext)
      @section.append child.section.toFragment()

module.exports = ForDecor
