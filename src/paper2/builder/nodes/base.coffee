async = require "async"
pcid = 0

class Base

  ###
  ###

  constructor: () ->
    @_children = []

  ###
   binds element rep to this node
  ###

  bind: (@elements) ->

  ###
   writes HTML to the DOM
  ###

  load: (info, callback) -> 

    # TODO - load modules here.
    info.nodes[pcid] = @

    @_writeHead info, (err) =>
      return callback(err) if err?

      @_loadChildren info, (err) =>
        return callback(err) if err?
        
        @_writeTail info, (err) -> 
          return callback err, info

  ###
  ###

  _writeHead: (info, callback) ->
    callback()

  ###
  ###

  _loadChildren: (info, callback) -> 
    Base.loadEachItem @_children or [], info, callback

  ###
  ###

  _writeTail: (info, callback) ->
    callback()


  ###
  ###

  addChild: () ->
    for child in arguments
      child.parent = @
      @_children.push child


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