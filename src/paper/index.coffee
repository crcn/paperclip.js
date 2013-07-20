Context    = require "./context"
pilot      = require "pilot-block"       
asyngleton = require "asyngleton"
modifiers  = require "./defaultModifiers"
nodeFactories = require "./nodeFactories"

fragment = require "./writers/fragment"
element  = require "./writers/element"
text     = require "./writers/text"
block    = require "./writers/block"

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

  load: (context) ->
    context.nodeFactory = @nodeFactory
    writer = fragment @templateFactory(block, element, text)
    writer.load context

  ###
  ###

  bind: (context) -> @load(context).bind()



module.exports = (templateFactory, nodeFactory) -> new Paper templateFactory, nodeFactory
module.exports.Context = Context
module.exports.registerModifier = (name, modifier) ->
  modifiers[name] = modifier


