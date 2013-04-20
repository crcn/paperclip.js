
class Expression
    
  constructor: () ->
    @_children = []


  addChild: () -> 
    for child in arguments
      child._parent = @
      @_children.push child


  references: () -> 
    refs = []
    for child in @_children
      refs = refs.concat child.references()
    refs


exports.Expression = Expression