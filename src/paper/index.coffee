template  = require "./template"
nofactor  = require "nofactor"
modifiers = require "./modifiers"


module.exports = 
  
  # parses a template
  template: template

  # registers a binding modifier 
  # {{ message | titlecase() }}
  modifier: (name, modifier)  ->
    modifiers[name] = modifier

  # creates a node shim - useful for 
  # adding support for browsers - e.g: placeholder
  # text for IE
  shim: (options) ->
    throw new Error "shims not supported yet"




