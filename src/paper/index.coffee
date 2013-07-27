Template = require "./template"

###
 creates new bindings
###

exports.template = (paper, nodeFactory) ->
  new Template paper, nodeFactory

###
  paperclip modifiers using pipes
###

module.exports.registerModifier = (name, modifier) ->
  modifiers[name] = modifier