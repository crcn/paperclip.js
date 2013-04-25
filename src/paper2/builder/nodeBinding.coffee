async = require("async")
base  = require("./base")

class AttributeBinding extends require("./base")

  ###
  ###

  constructor: (@name, @buffer) ->
    

  ###
  ###

  write: (info, callback) ->
    info.buffer.push " #{@name}=\"value\""
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