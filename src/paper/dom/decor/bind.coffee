Clip     = require "../../../clip"
Template = require "../../template"
handlers = require "./handlers"


class Decorator
  
  ###
  ###

  constructor: (@data, @element) ->

    @_clip = new Clip { scripts: Clip.compile(@_dataBind(element)), data: @data, watch: false }
    @_handlers = []

    for action in @_clip.scripts.names

      clazz = handlers[action] or handlers.base
      script = @_clip.script(action)
      @_handlers.push handler = new clazz script, @_clip, element
      @traverse = handler.traverse isnt false

  ###
  ###

  init: () ->
    for handler in @_handlers
      handler.dom = @dom
      handler.init?()

  ###
  ###

  _dataBind: (element) ->
    for attr in element.attributes
      return attr.value if attr.name is "data-bind"
    
  ###
  ###

  @test: (element) -> 
    for attr in element.attributes
      return true if attr.name is "data-bind"
    return false


module.exports = Decorator