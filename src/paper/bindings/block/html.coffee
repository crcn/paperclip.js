type = require "type-component"

# HTML section for 
class HtmlDecor extends require("./base")
    
  ###
  ###

  _onChange: (value, oldValue) -> 

    oldValue?.remove?()

    unless value
      return @section.removeAll() 

    if value.render?
      node = value.render()

    # DOM element?
    else if value.nodeType?
      node = value

    # string?
    else 

      # using the string node factory? create a text node
      if @nodeFactory.name is "string"
        node = @nodeFactory.createTextNode String value

      # browser?
      else
        dom = @nodeFactory.createElement "div"
        dom.innerHTML = String value
        node = @nodeFactory.createFragment dom.childNodes
            
    # since sections are flat, it's possible for
    # the node to be the parent node of this section
    if node is @section.start.parentNode
      return

    @section.replaceChildNodes node

  ###
  ###

  unbind: () ->
    super()
    @_onChange undefined, @value


module.exports = HtmlDecor