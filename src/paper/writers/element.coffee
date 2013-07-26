attrFactory = require("../decor/attrFactory")


class ElementWriter 

  ###
  ###

  constructor: (@paper, @nodeFactory) ->

  ###
  ###

  write: (name, attributes, children) =>  
    element = @nodeFactory.createElement

    for child in children
      element.appendChild child

    element




module.exports = ElementWriter