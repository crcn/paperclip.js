Clip      = require "../clip"
template  = require "./template"
nofactor  = require "nofactor"
mappers   = require "./mappers"
bindings  = require "./bindings"
bindable  = require "bindable"


module.exports = 
  
  ###
  ###

  Clip: Clip

  ###
  ###
  bindable: bindable

  ###
   parses a template
  ###

  template: template

  ###
   registers a binding modifier 
   {{ message | titlecase() }}
  ###

  map: (name, mapper)  ->
    mappers[name] = mapper

  ###
   expose the class so that one can be registered
  ###

  BaseBlockBinding: bindings.BaseBlockBinding

  ###
  ###

  BaseNodeBinding: bindings.BaseNodeBinding

  ###
  ###

  BaseAttrDataBinding: bindings.BaseAttrDataBinding

  ###
   adds a block binding class
   {{#custom}}
   {{/}}
  ###

  blockBinding: bindings.blockBindingFactory.register

  ###
   adds a node binding shim
   <custom />
   <div custom="" />
  ###

  nodeBinding: bindings.nodeBindingFactory.register
  ###
    data-bind="{{ custom: binding }}"
  ###

  attrDataBinding: bindings.nodeBindingFactory.dataBind.register




