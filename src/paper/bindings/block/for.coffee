type = require "type-component"

# HTML section for 
class ForDecor extends require("./base")
    
  ###
   TODO - should not clone the object - needs to be a subindable context
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

    # if the source changes, need to remove all items in the array, and reset
    @section.removeAll()

    # TODO - need to watch the source for any changes, and add / remove items
    # as the source dynamically changes
    for key of value

      # create the new subindable context
      subContext = @_clone(context)

      # TODO - this needs to be .set("key", key), and .set("value", value[key])
      subContext.key    = key
      subContext.value = value[key]

      # use the child template provided in this block, and pass-on the context
      child = @contentTemplate.bind(subContext)

      # add the listed item
      @section.append child.section.toFragment()

module.exports = ForDecor
