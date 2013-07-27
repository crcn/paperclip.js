async = require "async"

class Collection
  
  ###
  ###

  constructor: (@clip) ->
    @_models = []

  ###
  ###

  push: (model) ->
    @_models.push model


  ###
  ###

  unbind: () ->
    @_bound = false
    @clip.dispose()
    for model in @_models
      model.unbind()


  ###
  ###

  load: (context) -> 
  
    @clip.reset context

    for decor in @_models
      decor.load context


  ###
  ###

  bind: () ->
    @clip.watch()
    return if @_bound
    @_bound = true
    for decor in @_models
      decor.bind()


module.exports = Collection

