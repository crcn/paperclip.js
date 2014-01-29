bindable = require "bindable"
Clip = require "./index"

###
  watches for any changes in the template data
###

class ClippedBufferPart

  ###
  ###

  constructor: (@clippedBuffer, @script) ->

    # clip into the renderer data with the function that binds to it.
    @clip = new Clip { script: @script, application: @clippedBuffer.application  }

    # bind to update, but ONLY bind on changes. This won't get fired if value
    # isn't undefined.
    @clip.bind("value", @_onUpdated)

  ###
  ###

  dispose: () ->
    @clip.dispose()

  ###
  ###

  update: () ->
    @clip.reset @clippedBuffer._data
    @clip.update()
    @value = @clip.get("value")


  ###
  ###

  _onUpdated: (value) =>
    @value = value

    # dirty
    return if @clippedBuffer._updating

    # changed? update the renderer.
    @clippedBuffer.update()

  ###
  ###

  toString: () -> String @value ? ""


###
 Keeps track of each template block. E.g: hello {{craig}}, how are you?
###

class ClippedBuffer extends bindable.Object

  ###
  ###

  constructor: (buffer, @application) ->
    super()

    @buffer   = []
    @bindings = []
    @_data    = {}

    for bufferPart in buffer
      if bufferPart.fn
        @buffer.push binding = new ClippedBufferPart @, bufferPart
        @bindings.push binding
      else
        @buffer.push bufferPart

  ###
  ###

  reset: (data = {}) ->
    @_data = data
    @update()
    @

  ###
  ###

  dispose: () ->
    for binding in @bindings
      binding.dispose()

    @bindings = []

  ###
   updates the current text by stringifying the buffer
  ###

  update: () ->

    @_updating = true

    for binding in @bindings
      binding.update()

    @set "text", @text = @render()

    @_updating = false

  ###
   stringifies the buffer
  ###

  render: () -> @buffer.join ""

  ###
  ###

  toString: () -> @text

module.exports = ClippedBuffer

