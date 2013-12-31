BaseBinding = require "./base/index"

class Collection extends BaseBinding
  
  ###
  ###

  constructor: (@node, @_source = []) ->

  ###
  ###

  push: () -> 
    @_source.push arguments...
    
  ###
  ###

  bind: (context, node) -> 
    return if @_bound
    @_bound = true
    for binding in @_source
      binding.bind(context, node) 
    return

  ###
  ###

  unbind: () ->
    return unless @_bound
    @_bound = false
    binding.unbind() for binding in @_source
    return


module.exports = Collection

