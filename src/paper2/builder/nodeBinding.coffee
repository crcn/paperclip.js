async = require("async")
ClippedBuffer = require("../../clip/buffer")
Base = require "./base"
utils = require "./utils"

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


class NodeBinding extends Base

  ###
  ###

  name: "nodeBinding"

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
    info.buffer.push "<#{@name}"
    utils.startBindingBlock @, info
      
    Base.loadEachItem @attrs, info, () ->
      info.buffer.push ">"
      callback()

  ###
  ###

  _writeTail: (info, callback) ->
    info.buffer.push "</#{@name}>"
    utils.endBindingBlock @, info
    super info, callback

  ###
  ###

  clone: () -> new NodeBinding @name, @options



module.exports = NodeBinding