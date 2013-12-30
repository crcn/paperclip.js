class BaseWriter
  
  ###
  ###

  constructor: (@loader) ->
    @nodeFactory  = loader.application.nodeFactory
    @application  = @loader.application
    @bindings     = loader.bindings
    @template     = loader.template
    @bindingPaths = loader.bindingPaths

  ###
  ###

  write: (script, contentFactory, childBlockFactory) ->




module.exports = BaseWriter