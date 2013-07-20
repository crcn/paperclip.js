async   = require "async"

class Base

  ###
  ###

  __isNode: true

  ###
  ###

  constructor: (children = []) ->
    @children = children
    for child in children
      child.parent = @

  ###
  ###

  bind: () ->
    for child in @children or []
      child.bind()
    @

  ###
  ###

  unbind: () ->
    for child in @children or []
      child.unbind()

  ###
  ###

  load: (@context) -> 
    @context = context
    @node = @createNode context.nodeFactory
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
      @children.push child

  ###
  ###

  createNode: (nodeFactory) -> nodeFactory.createFragment()


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