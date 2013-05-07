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

