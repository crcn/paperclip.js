async = require("async")
base  = require("./base")
ClippedBuffer = require("../../clip/buffer")

class AttributeBinding extends require("./base")

  ###
  ###

  constructor: (@name, buffer) ->
    @clippedBuffer = new ClippedBuffer buffer


  ###
  ###

  write: (info, callback) ->
    @clippedBuffer.data info.data
    info.buffer.push " #{@name}=\"#{@clippedBuffer.text}\""
    callback()


class NodeBinding extends require("./bindable")

  ###
  ###

  constructor: (@name, options = {}) ->
    super()
    attrs   = options.attrs or {}

    attrsArray = []
    for key of attrs
      attrsArray.push new AttributeBinding key, attrs[key]

    @attrs = attrsArray
    @addChild (options.children or [])...


  ###
  ###

  _writeHead: (info, callback) ->
    super info
    info.buffer.push "<#{@name}"
      
    console.log @attrs
    base.writeEachItem @attrs, info, () ->
      info.buffer.push ">"
      callback()

  ###
  ###

  _writeTail: (info, callback) ->
    info.buffer.push("</#{@name}>")
    super info
    callback()





module.exports = NodeBinding