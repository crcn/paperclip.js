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

  bind: (@context) -> 
    return if @_bound
    @_bound = true
    binding.bind(@context) for binding in @_source
    return

  ###
  ###

  unbind: () ->
    return unless @_bound
    @_bound = false
    binding.unbind() for binding in @_source
    return


module.exports = Collection

