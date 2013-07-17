async = require("async")
ClippedBuffer = require("../../clip/buffer")
Base = require "./base"
attrFactory = require("../decor/attrFactory")



class NodeBinding extends require("./base")

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

  _load: (writer) ->
    @target = writer.createElement @name
    super writer

  ###
  ###

  _loadChildren: (writer) ->
    @_decor.load writer
    super writer

  ###
  ###

  clone: () -> new NodeBinding @name, @options



module.exports = NodeBinding