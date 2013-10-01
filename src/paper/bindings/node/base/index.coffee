class BaseNodeBinding extends require("../../base")
  
  ###
  ###

  constructor: (options) ->
    @name  = options.name or @name
    @node  = options.node
    @value = options.value
    @context = options.context

  ###
  ###

  bind: (@context) ->

  ###
  ###

  unbind: () ->

module.exports = BaseNodeBinding