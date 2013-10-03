type = require "type-component"

# HTML section for 
class HtmlDecor extends require("./base")
    
  ###
  ###

  _onChange: (value, oldValue) -> 

    if oldValue?.section
      oldValue.section.hide()

    @section.removeAll()

    unless value
      return @section.removeAll() 

    # TODO - change this stuff to .render & .remove()

    if value.createFragment
      node = value.createFragment()
    else if value.section
      node = value.section.show().toFragment()
    else if value.nodeType?
      node = value
    else 

      if @nodeFactory.name is "string"
        node = @nodeFactory.createTextNode String value
      else
        dom = @nodeFactory.createElement "div"
        dom.innerHTML = String value
        node = @nodeFactory.createFragment dom.childNodes

    @section.replaceChildNodes node


module.exports = HtmlDecor