async = require("async")
ClippedBuffer = require("../../clip/buffer")
Base = require "./base"
attrFactory = require("../decor/attrFactory")

class AttributeBinding extends Base
  
  ###
  ###

  constructor: (@name, buffer) ->
    super()
    @clippedBuffer = new ClippedBuffer buffer

  ###
  ###

  load: (info, callback) ->
    @clippedBuffer.reset info.data
    if @clippedBuffer.text.length
      info.buffer.push " #{@name}=\"#{@clippedBuffer.text}\""
    callback()


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

  _writeHead: (context, callback) ->
    this._writeStartBlock(context)
    context.buffer.push "<#{@name}"
    callback()

  ###
  ###

  _loadChildren: (context, callback) ->
    @_decor.load context, () =>
      context.buffer.push ">"
      super context, callback

  ###
  ###

  _writeTail: (context, callback) ->
    context.buffer.push "</#{@name}>"
    this._writeEndBlock(context)
    callback()

  ###
  ###

  clone: () -> new NodeBinding @name, @options



module.exports = NodeBinding