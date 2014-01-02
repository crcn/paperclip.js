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
    bindings = new BindingCollection()
    for binder in @_source
      bindings.push binder.getBinding(node) 
    return bindings



module.exports = Collection

