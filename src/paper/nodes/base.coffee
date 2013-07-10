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

  attach: (element, context) ->

    @load context

    if element.__isNode
      element.section.append pilot.createSection context.buffer.join("")
      pilot.update element.section.parent
    else
      element.innerHTML = context.buffer.join("")
      pilot.update element

    @bind()


  ###
  ###

  load: (@stream) -> 
    @target = @createNode stream
    @_loadChildren stream
    @

  ###
  ###

  _loadChildren: (stream) -> 
    for child in @children
      @target.appendChild child.load stream

  ###
  ###

  addChild: () ->
    for child in arguments
      child.parent = @
      @children.push child

  ###
  ###

  createNode: (stream) -> stream.createElement "div"

  ###
   used mostly for block bindings
  ###

  @cloneEach: (source) ->
    items = []
    for item in source
      items.push item.clone()
    items


module.exports = Base