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

    super options.children

    @options = options
    @attributes = options.attrs or {}
    @_decor     = attrFactory.getDecor @


  ###
  ###

  bind: () =>
    super()
    @_decor.bind()
    @

  ###
  ###

  unbind: () ->
    super()
    @_decor.unbind()
    @

  ###
  ###

  _loadChildren: (context) ->
    @_decor.load context
    super context

  ###
  ###

  clone: () -> new NodeBinding @name, @options

  ###
  ###

  createNode: (nodeFactory) -> nodeFactory.createElement @name



module.exports = (name, options) -> new NodeBinding name, options