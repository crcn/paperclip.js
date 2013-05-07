bindable = require "bindable"
pilot    = require "pilot-block"

class Context extends bindable.Object

  ###
  ###

  constructor: (data, @parent) ->
    super data

    # the root context
    @root     = @parent?.root or @

    # the buffer on initial load
    @buffer   = @root.buffer or []

    # internal data such as defined templates
    @internal = @root.internal or new bindable.Object()


    if @root is @
      @bindings = []


  ###
  ###

  addBinding: (binding) ->
    @root.bindings.push binding



  ###
  ###

  get: (key) -> super(key) ? @parent?.get(key)

  ###
  ###

  child: (data = {}) ->  new Context data, @

  ###
  ###

  detachBuffer: () -> 
    @buffer = []
    @

  ###
  ###

  attachBuffer: () ->
    @buffer = @root.buffer or @buffer
    @




module.exports = Context