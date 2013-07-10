async = require("async")
ClippedBuffer = require("../../clip/buffer")
Base = require "./base"
attrFactory = require("../decor/attrFactory")



class NodeBinding extends require("./bindable")

  ###
  ###

  name: "element"

  ###
  ###

  constructor: (@name, @options = {}) ->
    super()
    @attributes = options.attrs or {}
    @_decor     = attrFactory.getDecor @

    if options.children
      @addChild options.children

  ###
  ###

  bind: () =>
    super()
    @_decor.bind()
    @

  ###
  ###

  _load: (stream) ->
    @target = stream.createElement @name
    super stream

  ###
  ###

  _loadChildren: (stream) ->
    @_decor.load stream
    super stream

  ###
  ###

  clone: () -> new NodeBinding @name, @options



module.exports = NodeBinding