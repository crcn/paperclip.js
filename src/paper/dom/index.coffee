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
      decor = @_decorFactory.attach context, element
      if decor
        decor.dom = @
        decor.init()
        return decor.traverse isnt false

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

