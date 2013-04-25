async = require("async")
ClippedBuffer = require("../../clip/buffer")
Base = require "./base"

class AttributeBinding extends Base
  

  ###
  ###

  constructor: (@name, buffer) ->
    @clippedBuffer = new ClippedBuffer buffer


  ###
  ###

  write: (info, callback) ->
    @clippedBuffer.reset info.data
    info.buffer.push " #{@name}=\"#{@clippedBuffer.text}\""
    callback()


class NodeBinding extends require("./bindable")

  ###
  ###

  type: "node"

  ###
  ###

  constructor: (@name, @options = {}) ->
    super()
    attrs   = options.attrs or {}

    attrsArray = []
    for key of attrs
      attrsArray.push new AttributeBinding key, attrs[key]

    @attrs = attrsArray

    if options.children
      @addChild options.children

  ###
  ###

  _writeHead: (info, callback) ->
    @_bindingStart info
    info.buffer.push "<#{@name}"
      
    Base.writeEachItem @attrs, info, () ->
      info.buffer.push ">"
      callback()

  ###
  ###

  _writeTail: (info, callback) ->
    info.buffer.push "</#{@name}>"
    @_bindingEnd info
    callback()

  ###
  ###

  clone: () -> new NodeBinding @name, @options



module.exports = NodeBinding