async   = require "async"
pilot   = require "pilot-block"
Context = require "../context"

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
    @section?.dispose()
    for child in @children or []
      child.dispose()

  ###
  ###

  load: (@writer) -> 
    @target = @createNode writer
    @_loadChildren writer
    @

  ###
  ###

  _loadChildren: (writer) -> 
    for child in @children
      @target.appendChild child.load(writer).target

  ###
  ###

  addChild: () ->
    for child in arguments
      child.parent = @
      @children.push child

  ###
  ###

  createNode: (writer) -> writer.createElement "div"

  ###
   used mostly for block bindings
  ###

  @cloneEach: (source) ->
    items = []
    for item in source
      items.push item.clone()
    items


module.exports = Base