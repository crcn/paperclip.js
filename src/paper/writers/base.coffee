class BaseWriter
  
  ###
  ###

  constructor: (@template) ->
    @nodeFactory  = template.application.nodeFactory
    @application  = @template.application
    @binders      = template.binders

  ###
  ###

  write: (script, contentFactory, childBlockFactory) ->




module.exports = BaseWriter