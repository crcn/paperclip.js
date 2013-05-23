
class TextBinding extends require("./base")
  
  ###
  ###

  constructor: (node, @attrName, @clippedBuffer) ->
    super node

  ###
  ###

  bind: () ->
    super()
    @clippedBuffer.bind("text").watch(true).to @_onChange

  ###
  ###

  load: (@context, callback) ->
    @clippedBuffer.reset context

    if @clippedBuffer.text.length
      context.buffer.push " #{@attrName}=\"#{@clippedBuffer.text}\""

    callback()

  ###
  ###

  _onChange: (value) =>
    @node.section.elements[0].setAttribute(@attrName, value)

module.exports = TextBinding