class BaseWriter
  
  ###
  ###

  constructor: (@loader) ->
    @nodeFactory = loader.nodeFactory
    @bindings    = loader.bindings



module.exports = BaseWriter