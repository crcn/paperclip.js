Context    = require "./context"
Html       = require "./nodes/html"
pilot      = require "pilot-block"       
asyngleton = require "asyngleton"
modifiers  = require "./defaultModifiers"

class Paper

  ###
  ###

  constructor: (@factory) ->
    @modifiers = modifiers
    @node = @factory @

  ###
  ###

  load: (context) -> 
    @node.load context

  ###
  ###

  attach: (element, context) -> 
    @node.attach element, context

  ###
  ###

  create: () -> new Html()



module.exports = (fn) -> new Paper(fn)
module.exports.Context = Context
module.exports.registerModifier = (name, modifier) ->
  modifiers[name] = modifier


