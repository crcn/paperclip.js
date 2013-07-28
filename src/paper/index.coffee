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
   adds a block binding class
  ###

  blockBinding: (blockBindingClass) ->
    bindings.blockBindingFactory.register blockBindingClass

  ###
   adds a node binding class
  ###

  nodeBinding: (nodeBindingClass) ->
    bindings.nodeBindingFactory.register nodeBindingClass




