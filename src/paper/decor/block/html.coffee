type = require "type-component"

# HTML section for 
class HtmlDecor extends require("./base")
  

  ###
  ###

  load: (@context) ->
    html = @clip.get("html")
    return if not html?
    @_onChange html

  ###
  ###

  bind: () ->
    super()
    @child?.bind()

  ###
  ###

  unbind: () ->
    super()
    @child?.unbind()

  ###
  ###

  _onChange: (value) -> 

    unless value
      @block.removeAll() 

    if value.__isWriter
      node = value.node
    else if value.__isNode
      node = value
    else if type(value) is "string"
      node = @context.nodeFactory.parseHtml value 

    @block.replaceAll node


module.exports = HtmlDecor