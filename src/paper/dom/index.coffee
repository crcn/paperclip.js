DecororFactory = require "./decor"

class DOM
  
  ###
  ###

  constructor: () ->
    @_decorFactory = new DecororFactory()

  ###
  ###

  attach: (context, element) ->
    @_traverse @_element(element), (element) =>
      decors = @_decorFactory.attach context, element
      if decors
        for decor in decors
          decor.dom = @
          decor.init()
          traverse = decor isnt false

        return false if traverse is false

  ###
  ###

  _traverse: (element, callback) ->
    return if element.nodeName is "#comment"
    traverse = callback element
    return if traverse is false
    for child in element.childNodes
      if @_traverse(child, callback) is false
        break

  ###
  ###

  _element: (element) ->
    return element[0] or element



module.exports = DOM

