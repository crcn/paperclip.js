Parser = require "./parser"
Clip   = require "../../clip"
events = require "events"
bindable = require "bindable"

parser = new Parser()

class TemplateBinding

  ###
  ###

  constructor: (@renderer, @fn) ->
    @clip = new Clip { script: @fn, data: @renderer._data }
    @clip.bind("value").watch(true).to(@update)
    @value = @clip.get("value")

  ###
  ###

  dispose: () ->
    @clip.dispose()


  ###
  ###

  update: (value) =>
    @value = value
    @renderer.update()

  ###
  ###

  toString: () -> @value


class TemplateRenderer extends bindable.Object

  ###
  ###

  constructor: (@_data, @fn) ->
    super()
    @buffer = []
    @bindings = []
    @fn.call @
    @update()

  ###
  ###

  dispose: () ->
    for binding in @bindings
      binding.dispose()

    @bindings = []

  ###
  ###

  push: (source) ->   
    @buffer.push source
    @

  ###
  ###

  pushBinding: (script) ->
    @buffer.push binding = new TemplateBinding @, script
    @bindings.push binding
    @

  ###
  ###

  update: () ->
    @set "text", @text = @render()

  ###
  ###

  render: () -> @buffer.join ""

  ###
  ###

  toString: () -> @text


class Template

  ###
  ###

  constructor: (source) -> 
    @fn = new Function "return " + parser.parse source 


  ###
  ###

  render: (data) ->
    new TemplateRenderer(data, @fn)


module.exports = Template


