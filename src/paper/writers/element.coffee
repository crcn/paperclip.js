# nodeBindingFactory = require("../decor/node")


class ElementWriter extends require("./base")

  ###
  ###

  write: (name, attributes, children) =>  

    # create the DOM element here first
    element = @nodeFactory.createElement name

    # finally add the child elements
    for child in children
      element.appendChild child

    element




module.exports = ElementWriter