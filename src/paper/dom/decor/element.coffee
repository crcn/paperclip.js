Template = require "../../../translate/template"

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

  ###
  ###

  _change: (value) =>
    if @name is "value"
      @element.value = value
    else
      $(@element).attr(@name, @currentValue = value)



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