class ChildrenExpression extends require("./collection")

  _type: "children"
  
  ###
  ###

  constructor: (items) ->
    super items

  ###
  ###

  toString: () -> 
    "{ children: #{super()} }"

module.exports = ChildrenExpression