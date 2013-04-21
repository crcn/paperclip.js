Template = require "../../template"
Clip     = require "../../../clip"
handlers = require "./handlers"


class Decorator

  constructor: (@data, @element) ->

    @_clip = new Clip { script: Clip.compile(@_dataBind(element)), data: @data }
    @_handlers = []

    for action in @_clip.watchers.names
      if handlers[action]
        clazz = handlers[action]
        @_handlers.push handler = new clazz @_clip.watcher(action), @_clip, element
        @traverse = handler.traverse isnt false


  init: () ->
    for handler in @_handlers
      handler.dom = @dom
      handler.init?()

  _dataBind: (element) ->
    for attr in element.attributes
      return attr.value if attr.name is "data-bind"
    
  
  @test: (element) -> 
    for attr in element.attributes
      return true if attr.name is "data-bind"
    return false


module.exports = Decorator