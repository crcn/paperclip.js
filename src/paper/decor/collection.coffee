async = require "async"

class Collection
  
  ###
  ###

  constructor: () ->
    @_items = []

  ###
  ###

  push: (item) ->
    @_items.push item


  ###
  ###

  dispose: () ->
    @clip?.dispose()
    for item in @_items
      item.dispose()


  ###
  ###

  load: (context, callback) -> 
    @clip?.reset context, false
    async.eachSeries @_items, ((decor, next) ->
      decor.load context, next
    ), callback


  ###
  ###

  bind: () ->
    return if @_bound
    @_bound = true
    for decor in @_items
      decor.bind()


module.exports = Collection

