Context    = require "./context"
Html       = require "./nodes/html"
pilot      = require "pilot-block"       
asyngleton = require "asyngleton"
modifiers  = require "./defaultModifiers"
writers    = require "./writers"

class Paper

  ###
  ###

  constructor: (@factory) ->
    @modifiers = modifiers
    @node = @factory @

  ###
  ###

  load: (@writer) -> 
    @node.load writer

  ###
  ###

  create: () -> new Html()



module.exports = (fn) -> new Paper(fn)
module.exports.Context = Context
module.exports.registerModifier = (name, modifier) ->
  modifiers[name] = modifier


