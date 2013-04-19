
class Evaluator
    
  ###
  ###

  constructor: (@expr, @clip) ->
    @context = clip
    @_children = []

  ###
  ###

  init: () ->
    for child in @_children
      child.init()

  ###
  ###

  linkChild: (evaluator) -> 
    evaluator._parent = @
    @_children.push evaluator
    evaluator

  ###
  ###

  _change: () =>
    @_parent?._change()

exports.Evaluator = Evaluator