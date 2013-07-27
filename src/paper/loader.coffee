modifiers = require "./defaultModifiers"
FragmentWriter = require "./writers/fragment"
BlockWriter = require "./writers/block"
TextWriter = require "./writers/text"
ElementWriter = require "./writers/element"

class Loader
  
  ###
  ###

  constructor: (@template) ->

    @nodeFactory = template.nodeFactory
    @paper       = template.paper


    @bindings = []

    @_writers = 
      fragment : new FragmentWriter @
      block    : new BlockWriter @
      text     : new TextWriter @
      element  : new ElementWriter @

  ###
  ###

  load: (@context) ->

    @node = @paper @_writers.fragment.write,
    @_writers.block.write,
    @_writers.element.write,
    @_writers.text.write,
    modifiers

    for binding in @bindings
      binding.load context

    @

  ###
  ###

  bind: () ->
    for binding in @bindings
      binding.bind context
    @

  ###
  ###

  toString: () -> @node.toString()

module.exports = Loader
