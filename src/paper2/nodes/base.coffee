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
    @section.dispose()

  ###
  ###

  attach: (element, context, callback = (() ->)) ->
    @load context.detachBuffer(), (err) =>
      return callback(err) if err?

      if element.__isNode
        element.section.append pilot.createSection context.buffer.join("")
        pilot.update element.section.parent
      else
        element.innerHTML = context.buffer.join("")
        pilot.update element

      @bind()
      callback()



  ###
   writes HTML to the DOM
  ###

  load: (@context, callback) ->  

    @_writeHead context, (err) =>
      return callback(err) if err?

      @_loadChildren context, (err) =>
        return callback(err) if err?
        
        @_writeTail context, (err) -> 
          return callback err, context

    @

  ###
  ###

  _writeHead: (info, callback) ->
    callback()

  ###
  ###

  _loadChildren: (info, callback) -> 
    Base.loadEachItem @children or [], info, callback

  ###
  ###

  _writeTail: (info, callback) ->
    callback()

  ###
  ###

  addChild: () ->
    for child in arguments
      child.parent = @
      @children.push child

  ###
  ###

  @loadEachItem: (source, info, callback) ->
    async.eachSeries source, ((child, next) ->
      child.load info, next
    ), callback

  ###
   used mostly for block bindings
  ###

  @cloneEach: (source) ->
    items = []
    for item in source
      items.push item.clone()
    items


module.exports = Base