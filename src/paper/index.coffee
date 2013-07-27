template = require "./template"
nofactor = require "nofactor"

###
 creates new bindings
###

exports.template = template

###
  paperclip modifiers using pipes
###

module.exports.registerModifier = (name, modifier) ->
  modifiers[name] = modifier