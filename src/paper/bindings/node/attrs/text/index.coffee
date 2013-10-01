type = require "type-component"
ClippedBuffer = require "../../../../../clip/buffer"

class AttrTextBinding extends require("../../base")
  
  ###
  ###

  type: "attr"

  ###
  ###

  constructor: (options) ->
    super options
    @clippedBuffer = new ClippedBuffer @value

  ###
  ###

  bind: (@context) ->
    @_binding = @clippedBuffer.reset(@context).bind("text").to(@_onChange).now()

  ###
  ###

  unbind: () ->
    @_binding?.dispose()
    @_binding

  ###
  ###

  _onChange: (text) =>

    unless text.length
      @node.removeAttribute @name
      return

    @node.setAttribute @name, text
    @nodeModel.set @name, text


  ###
  ###

  test: (binding) ->

    return false unless type(binding.value) is "array"

    for v in binding.value
      return true if v.fn

    return false

module.exports = AttrTextBinding