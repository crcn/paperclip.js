attrFactory = require("../decor/attrFactory")


class ElementWriter extends require("./base")

  ###
  ###

  write: (name, attributes, children) =>  
    element = @nodeFactory.createElement

    for child in children
      element.appendChild child

    element




module.exports = ElementWriter