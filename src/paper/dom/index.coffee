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
      # if decor.traverse

  ###
  ###

  _traverse: (element, callback) ->
    callback element
    for child in element.childNodes
      break if @_traverse(child, callback) is false


  ###
  ###

  _element: (element) ->
    return element[0] or element



module.exports = DOM

