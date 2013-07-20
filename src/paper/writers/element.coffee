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

  constructor: (@name, options = {}) ->
    super()
    @options = options
    @attributes = options.attrs or {}
    @_decor     = attrFactory.getDecor @

    if options.children
      @addChild options.children...

  ###
  ###

  bind: () =>
    super()
    @_decor.bind()
    @

  ###
  ###

  _load: (paper) ->
    @node = paper.createElement @name
    super context

  ###
  ###

  unbind: () ->
    super()
    @_decor.unbind()
    @

  ###
  ###

  _loadChildren: (paper) ->
    @_decor.load paper.context
    super paper

  ###
  ###

  clone: () -> new NodeBinding @name, @options

  ###
  ###

  createNode: (nodeFactory) -> nodeFactory.createElement @name



module.exports = (name, options) -> new NodeBinding name, options