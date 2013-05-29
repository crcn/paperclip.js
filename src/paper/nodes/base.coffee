async  = require "async"
pilot  = require "pilot-block"

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

    @load context.detachBuffer()

    if element.__isNode
      element.section.append pilot.createSection context.buffer.join("")
      pilot.update element.section.parent
    else
      element.innerHTML = context.buffer.join("")
      pilot.update element

    @bind()




  ###
   writes HTML to the DOM
  ###

  load: (@context) ->  

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
      child.load context

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