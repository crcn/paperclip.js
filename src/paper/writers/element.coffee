nodeBindingFactory = require("../bindings/node/factory")
type = require "type-component"


class ElementWriter extends require("./base")

  ###
  ###

  write: (name, attributes = {}, children = []) =>  

    # create the DOM element here first
    element = @nodeFactory.createElement name

 
    # separate bound attributes from attributes that never change
    for attrName of attributes
      v = attributes[attrName]

      if v.length is 1 and type(v[0]) is "string"
        element.setAttribute attrName, v[0]


    @bindings.push nodeBindingFactory.getBindings({
      node: element,
      nodeName: name,
      attributes: attributes
    })...

    # finally add the child elements
    for child in children
      element.appendChild child

    element




module.exports = ElementWriter