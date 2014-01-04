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
      value = attributes[attrName]
      continue if typeof value is "object"
      element.setAttribute attrName, value

    @binders.push nodeBindingFactory.getBinders({
      node: element,
      nodeName: name,
      application: @application,
      attributes: attributes
    })...

    # finally add the child elements
    for child in children
      element.appendChild child

    element




module.exports = ElementWriter