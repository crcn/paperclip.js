class Expression

  ###
  ###

  constructor: () ->
    @_children = []

  ###
  ###

  addChild: () -> 
    for child in arguments
      child._parent = @
      @_children.push child


exports.Expression = Expression