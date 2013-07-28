modifiers      = require "./modifiers"

FragmentWriter = require "./writers/fragment"
BlockWriter    = require "./writers/block"
TextWriter     = require "./writers/text"
ElementWriter  = require "./writers/element"

BindingCollection = require "./bindings/collection"
bindable = require "bindable"

class Loader

  ###
  ###

  __isLoader: true
  
  ###
  ###

  constructor: (@template) ->

    @nodeFactory = template.nodeFactory
    @paper       = template.paper

    @bindings = new BindingCollection()

    # writers needed for access to the binding collection
    @_writers = 
      fragment : new FragmentWriter @
      block    : new BlockWriter @
      text     : new TextWriter @
      element  : new ElementWriter @

  ###
  ###

  load: (context = {}) ->


    console.log String @paper

    unless context.__isBindable
      context = new bindable.Object context

    @context = context

    # writes the DOM
    @node = @paper @_writers.fragment.write,
    @_writers.block.write,
    @_writers.element.write,
    @_writers.text.write,
    modifiers

    @

  ###
  ###

  bind:() ->
    @bindings.bind @context
    @


  ###
  ###

  unbind: () -> 
    @bindings.unbind()
    @

  ###
  ###

  toString: () -> @node.toString()

module.exports = Loader
