class BaseNodeBinding extends require("../../base")
  
  ###
  ###

  constructor: (options) ->
    @name  = options.name or @name
    @node  = options.node
    @value = options.value

  ###
  ###

  bind: (@context) ->

  ###
  ###

  unbind: () ->

module.exports = BaseNodeBinding