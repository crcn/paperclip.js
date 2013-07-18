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

  _load: (context) ->
    @node = context.createElement @name
    super context

  ###
  ###

  _loadChildren: (context) ->
    @_decor.load context
    super context

  ###
  ###

  clone: () -> new NodeBinding @name, @options



module.exports = NodeBinding