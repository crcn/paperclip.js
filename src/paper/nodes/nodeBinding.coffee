async = require("async")
ClippedBuffer = require("../../clip/buffer")
Base = require "./base"
attrFactory = require("../decor/attrFactory")



class NodeBinding extends require("./bindable")

  ###
  ###

  name: "nodeBinding"

  ###
  ###

  constructor: (@name, @options = {}) ->
    super()
    @attributes   = options.attrs or {}
    @_decor = attrFactory.getDecor @

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

  dispose: () ->
    super()
    @_decor.dispose()
    @

  ###
  ###

  _writeHead: (context) ->
    this._writeStartBlock context
    context.buffer.push "<#{@name}"

  ###
  ###

  _loadChildren: (context) ->
    @_decor.load context
    context.buffer.push ">"
    super context

  ###
  ###

  _writeTail: (context) ->
    context.buffer.push "</#{@name}>"
    this._writeEndBlock context

  ###
  ###

  clone: () -> new NodeBinding @name, @options



module.exports = NodeBinding