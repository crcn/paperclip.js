class ChildrenExpression extends require("./collection")

  _type: "children"
  
  ###
  ###

  constructor: (items) ->
    super items

  ###
  ###

  toJsString: () -> 
    "{ children: #{super()} }"

  ###
  ###

  toString: () -> @items.join ""

module.exports = ChildrenExpression