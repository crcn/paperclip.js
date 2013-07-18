Context    = require "./context"
Html       = require "./writers/html"
pilot      = require "pilot-block"       
asyngleton = require "asyngleton"
modifiers  = require "./defaultModifiers"
nodeFactories = require "./nodeFactories"

class Paper

  ###
  ###

  constructor: (@templateFactory, @nodeFactory) ->

    # node, or browser?
    unless @nodeFactory 
      if typeof window is "undefined"
        @nodeFactory = nodeFactories.string()
      else
        @nodeFactory = nodeFactories.dom()

    @modifiers = modifiers

  ###
  ###

  load: (@context) -> @templateFactory(@).load(context)

  ###
  ###

  bind: (@context) -> @load(context).bind()

  ###
  ###

  create: () -> new Html @



module.exports = (templateFactory, nodeFactory) -> new Paper templateFactory, nodeFactory
module.exports.Context = Context
module.exports.registerModifier = (name, modifier) ->
  modifiers[name] = modifier


