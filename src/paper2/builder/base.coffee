async = require "async"

class Base

  ###
  ###

  constructor: () ->
    @_children = []

  ###
  ###

  load: (info, callback) ->


  ###
  ###

  write: (info, callback) -> 

    @_writeHead info, (err) =>
      return callback(err) if err?

      @_writeChildren info, (err) =>
        return callback(err) if err?
        
        @_writeTail info, (err) -> 
          return callback err, info

  ###
  ###

  _writeHead: (info, callback) ->
    callback()

  ###
  ###

  _writeChildren: (info, callback) -> 
    Base.writeEachItem @_children, info, callback

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

  @writeEachItem: (source, info, callback) ->
    async.eachSeries source, ((child, next) ->
      child.write info, next
    ), callback

  ###
  ###

  @cloneEach: (source) ->
    items = []
    for item in source
      items.push item.clone()
    items
    

module.exports = Base