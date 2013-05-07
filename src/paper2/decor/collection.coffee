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

  load: (info, callback) -> 
    async.eachSeries @_items, ((decor, next) ->
      decor.load info, next
    ), callback


  ###
  ###

  bind: () ->
    return if @_bound
    @_bound = true
    for decor in @_items
      decor.bind()


module.exports = Collection

