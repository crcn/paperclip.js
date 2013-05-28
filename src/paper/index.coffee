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

  load: asyngleton (context, callback) -> 
    @node.load context, callback

  ###
  ###

  attach: (element, context, callback = (() ->)) -> 
    @node.attach element, context, callback

  ###
  ###

  create: () -> new Html()



module.exports = (fn) -> new Paper(fn)
module.exports.Context = Context
module.exports.registerModifier = (name, modifier) ->
  modifiers[name] = modifier


