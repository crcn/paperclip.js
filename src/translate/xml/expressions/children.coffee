class ChildrenExpression extends require("./collection")

  _type: "children"
  
  ###
  ###

  constructor: (items) ->
    super items

  ###
  ###

  toString: () ->   
    "this.children(#{@items.join(",")})"

module.exports = ChildrenExpression