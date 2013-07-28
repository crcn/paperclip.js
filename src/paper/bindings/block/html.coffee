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

  _onChange: (value) -> 

    unless value
      return @section.removeChildNodes() 

    if value.__isLoader
      node = value.node
    else if value.nodeType?
      node = value
    else 

      if typeof window is "undefined"
        node = @nodeFactory.createTextNode String value
      else
        dom = @nodeFactory.createNode "div"
        dom.innerHTML = String value
        node = @nodeFactory.createFragment dom.childNodes


    @section.replaceChildNodes node


module.exports = HtmlDecor