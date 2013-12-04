class BaseWriter
  
  ###
  ###

  constructor: (@loader) ->
    @nodeFactory = loader.application.nodeFactory
    @application = @loader.application
    @bindings    = loader.bindings
    @template    = loader.template



module.exports = BaseWriter