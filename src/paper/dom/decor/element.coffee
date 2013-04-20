Template = require "../../template"

class AttributeBinding
  
  constructor: (@data, @attribute, @element) ->
    @name = attribute.name
    @_template = new Template @attribute.value
    @_renderer = @_template.render @data
    @_renderer.bind("text").to @_change

    $(element).bind "mouseup keydown keyup change", @_elementChange


  _change: (value) =>
    @attribute.value = @currentValue = value


  _elementChange: (event) =>

    if @name is "value"
      value = @element.value
    else
      value = @attribute.value

    if @currentValue isnt value and (refs = @_bothWays()).length
      for refsByKey in refs
        for key of refsByKey
          refsByKey[key].value value




  _bothWays: () ->
    refs = []
    for binding in @_renderer.bindings
      if binding.clip.options.bothWays
        refs.push binding.clip.options.bothWays

    refs






class Decorator
  
  constructor: (@data, @element) ->
    @_bindings = []
    for attr in @element.attributes
      if !!~String(attr.value).indexOf "{{"
        @_bindings.push new AttributeBinding @data, attr, @element


  
  @test: (element) ->
    for attr in element.attributes
      return true if !!~String(attr.value).indexOf "{{"

    false


module.exports = Decorator