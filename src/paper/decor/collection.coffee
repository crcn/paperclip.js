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

  load: (context) -> 
  
    @clip?.reset context, false

    for decor in @_models
      decor.load context


  ###
  ###

  bind: () ->
    return if @_bound
    @_bound = true
    for decor in @_models
      decor.bind()


module.exports = Collection

