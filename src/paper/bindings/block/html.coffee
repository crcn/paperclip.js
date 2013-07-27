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
      return @block.removeAll() 

    if value.__isWriter
      node = value.node
    else if value.__isNode
      node = value
    else 
      node = @context.nodeFactory.parseHtml String value 

    @block.replaceAll node


module.exports = HtmlDecor