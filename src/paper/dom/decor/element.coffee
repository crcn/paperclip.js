Template = require "../../template"

class AttributeBinding
  
  ###
  ###

  constructor: (@data, @attribute, @element) ->
    @name = attribute.name
    @_template = new Template @attribute.value
    @_renderer = @_template.render @data

  ###
  ###

  init: () ->
    @_renderer.bind("text").to @_change
    $(@element).bind "mouseup keydown keyup change", @_elementChange

  ###
  ###

  _change: (value) =>
    @attribute.value = @currentValue = value

  ###
  ###

  _elementChange: (event) =>
    if @name is "value"
      value = @element.value
    else
      value = @attribute.value


class Decorator
  
  ###
  ###

  constructor: (@data, @element) ->
    @_bindings = []

  ###
  ###

  init: () ->
    for attr in @element.attributes
      if !!~String(attr.value).indexOf "{{"
        @_bindings.push binding = new AttributeBinding @data, attr, @element
        binding.init()

  ###
  ###
  
  @test: (element) ->
    for attr in element.attributes
      return true if !!~String(attr.value).indexOf "{{"

    false


module.exports = Decorator