BaseBinding = require "./base/binding"

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
    for binding in @_source
      binding.bind(context, node) 
    return

  ###
  ###

  unbind: () ->
    binding.unbind() for binding in @_source
    return


module.exports = Collection

