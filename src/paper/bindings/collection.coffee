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

  load: (context) -> 
    return if @_loaded
    @_loaded = true
    binding.load(context) for binding in @_source

  ###
  ###

  bind: () -> 
    return if @_bound
    @_bound = true
    binding.bind() for binding in @_source

  ###
  ###

  unbind: () ->
    return unless @_bound
    @_bound = false
    binding.bind() for binding in @_source


module.exports = Collection

