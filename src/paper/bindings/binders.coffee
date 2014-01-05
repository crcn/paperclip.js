BaseBinding = require "./base/index"
BindingCollection = require "./collection"

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

  getBindings: (node) -> 

    if @_source.length is 1
      return @_source[0].getBinding(node)

    bindings = new BindingCollection()
    for binder in @_source
      bindings.push binder.getBinding(node) 
    return bindings

  ###
  ###

  init: () ->
    for binder in @_source
      binder.init()



module.exports = Collection

