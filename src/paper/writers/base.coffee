class BaseWriter
  
  ###
  ###

  constructor: (@loader) ->
    @nodeFactory = loader.nodeFactory
    @bindings    = loader.bindings
    @template    = loader.template



module.exports = BaseWriter