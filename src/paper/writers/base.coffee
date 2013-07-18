async   = require "async"

class Base

  ###
  ###

  __isNode: true

  ###
  ###

  constructor: () ->
    @children = []

  ###
  ###

  bind: () ->
    for child in @children or []
      child.bind()
    @

  ###
  ###

  dispose: () ->
    for child in @children or []
      child.dispose()

  ###
  ###

  load: (@context) -> 
    @node = @createNode @paper.nodeFactory
    @_loadChildren context
    @

  ###
  ###

  _loadChildren: (context) -> 
    for child in @children
      @node.appendChild child.load(context).node

  ###
  ###

  addChild: () ->
    for child in arguments
      child.parent = @
      child.paper  = @paper
      @children.push child

  ###
  ###

  createNode: (nodeFactory) -> nodeFactory.createElement "div"


  ###
  ###

  toString: () -> @node.toString()

  ###
   used mostly for block bindings
  ###

  @cloneEach: (source) ->
    items = []
    for item in source
      items.push item.clone()
    items


module.exports = Base