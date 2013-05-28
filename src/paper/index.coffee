Context    = require "./context"
Html       = require "./nodes/html"
pilot      = require "pilot-block"       
asyngleton = require "asyngleton"

class Paper

  ###
  ###

  constructor: (@factory) ->
    @modifiers = require("./defaultModifiers")
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

  ###
  ###

  registeModifier: (name, modifier) ->
    @modifiers[name] = modifier




module.exports = (fn) -> new Paper(fn)
module.exports.Context = Context

