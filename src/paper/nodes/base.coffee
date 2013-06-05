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

  load: (context) -> 
    context.buffer   = context.buffer or []
    context.internal = new Context()
    @_load context


  ###
   writes HTML to the DOM
  ###

  _load: (@context) ->  

    @_writeHead context
    @_loadChildren context
    @_writeTail context

    @

  ###
  ###

  _writeHead: (info) ->

  ###
  ###

  _loadChildren: (context) -> 
    for child in @children
      child._load context

  ###
  ###

  _writeTail: (info) ->

  ###
  ###

  addChild: () ->
    for child in arguments
      child.parent = @
      @children.push child


  ###
   used mostly for block bindings
  ###

  @cloneEach: (source) ->
    items = []
    for item in source
      items.push item.clone()
    items


module.exports = Base