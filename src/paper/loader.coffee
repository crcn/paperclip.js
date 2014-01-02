modifiers      = require "./modifiers"

FragmentWriter = require "./writers/fragment"
BlockWriter    = require "./writers/block"
TextWriter     = require "./writers/text"
ElementWriter  = require "./writers/element"
ParseWriter    = require "./writers/parse"

BindingCollection = require "./bindings/collection"
BinderCollection  = require "./bindings/binders"
bindable = require "bindable"
loaf = require "loaf"

class Loader

  ###
  ###

  __isLoader: true
  
  ###
  ###

  constructor: (@template) ->

    # application is a replacement for DOM window
    @application = @template.application
    @nodeFactory = @application.nodeFactory
    @paper       = template.paper

    @bindings = new BindingCollection()



  ###
  ###

  load: (context = {}) ->
    
    unless context.__isBindable
      context = new bindable.Object context

    @context = context

    @_templateNodeClone = @_createTemplateNodeClone()

    @

  ###
   creates 
  ###

  _createTemplateNodeClone: () ->

    # TOOD
    if @paper.node
      @binders = @paper.binders
      return @paper.node.cloneNode(true)

    @binders = new BinderCollection()

    # writers needed for access to the binding collection
    writers = 
      fragment : new FragmentWriter @
      block    : new BlockWriter @
      text     : new TextWriter @
      element  : new ElementWriter @
      parse    : new ParseWriter @

    
    # writes the DOM
    node = @paper writers.fragment.write,
    writers.block.write,
    writers.element.write,
    writers.text.write,
    writers.parse.write,
    modifiers


    @paper.binders = @binders
    @paper.node = node
    @_createTemplateNodeClone()


  ###
  ###

  bind:() ->

    if @_bindings
      @_bindings.bind @context
      return

    @_bindings = @binders.getBindings(@_templateNodeClone)
    @_bindings.bind(@context)
    @section = loaf @nodeFactory
    @section.append @_templateNodeClone
    @

  ###
  ###

  render: () ->

    @section.show()
    @section

  ###
  ###

  remove: () ->
    @section.hide()
    @

  ###
  ###

  dispose: () ->
    @unbind()
    @section.dispose()
    @

  ###
  ###

  unbind: () -> 
    @_bindings.unbind()
    @

  ###
  ###

  toFragment: () ->
    @section.toFragment()

  ###
  ###

  toString: () -> 

    if @nodeFactory.name is "string"
      return @section.toString()

    frag = @section.toFragment()

    div = document.createElement "div"
    div.appendChild frag.cloneNode true
    return div.innerHTML



module.exports = Loader
