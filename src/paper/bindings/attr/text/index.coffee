class TextBinding extends require("../base")
  
  ###
  ###

  constructor: (node, @attrName) ->
    super node

  ###
  ###

  bind: () ->
    super()
    @clippedBuffer.bind("text").to @_onChange

  ###
  ###

  load: (@context) ->
    @clippedBuffer.reset context
    if @clippedBuffer.text.length
      context.buffer.push " #{@attrName}=\"#{@clippedBuffer.text}\""


  ###
  ###

  _onChange: (value) =>
    $(@node.section.elements).attr(@attrName, escapeHTML(value))

module.exports = TextBinding