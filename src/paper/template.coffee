Parser   = require "../translate/template/parser"
Clip     = require "../clip"
events   = require "events"
bindable = require "bindable"

###
  watches for any changes in the template data
###

class TemplateScript

  ###
  ###

  constructor: (@renderer, @fn) ->

    # clip into the renderer data with the function that binds to it.
    @clip = new Clip { script: @fn, data: @renderer._data }

    # bind to update, but ONLY bind on changes. This won't get fired if value
    # isn't undefined.
    @clip.bind("value").watch(true).to @update

    # set the initial value
    @value = @clip.get "value"

  ###
  ###

  dispose: () ->
    @clip.dispose()

  ###
  ###

  update: (value) =>
    @value = value

    # changed? update the renderer.
    @renderer.update()

  ###
  ###

  toString: () -> String @value


###
 Keeps track of each template block. E.g: hello {{craig}}, how are you?
###

class TemplateRenderer extends bindable.Object

  ###
  ###

  constructor: (@_data, @fn) ->
    super()

    @buffer   = []
    @bindings = []

    # call the interpreted template.
    # this function will call push, and pushScript
    @fn.call @

    @update()

  ###
  ###

  dispose: () ->
    for binding in @bindings
      binding.dispose()

    @bindings = []

  ###
   pushes a regular string to the buffer
  ###

  push: (source) ->   
    @buffer.push source
    @

  ###
   pushes a bindable block (dynamically changes), to the string buffer
  ###

  pushScript: (script) ->
    @buffer.push binding = new TemplateScript @, script
    @bindings.push binding
    @

  ###
   updates the current text by stringifying the buffer
  ###

  update: () ->
    @set "text", @text = @render()

  ###
   stringifies the buffer
  ###

  render: () -> @buffer.join ""

  ###
  ###

  toString: () -> @text


parser = new Parser()

class Template

  ###
  ###

  constructor: (source) -> 
    @fn = new Function "return " + parser.parse source 

  ###
  ###

  render: (data) ->
    new TemplateRenderer data, @fn


module.exports = Template


