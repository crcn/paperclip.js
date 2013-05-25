async = require "async"

class Collection
  
  ###
  ###

  constructor: () ->
    @_models = []

  ###
  ###

  push: (model) ->
    @_models.push model


  ###
  ###

  dispose: () ->
    @clip?.dispose()
    for model in @_models
      model.dispose()


  ###
  ###

  load: (context, callback) -> 
    @clip?.reset context, false
    async.eachSeries @_models, ((decor, next) ->
      decor.load context, next
    ), callback


  ###
  ###

  bind: () ->
    return if @_bound
    @_bound = true
    for decor in @_models
      decor.bind()


module.exports = Collection

