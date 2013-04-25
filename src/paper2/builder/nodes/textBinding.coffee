Clip = require "../../../clip"
utils = require "./utils"

class TextBinding extends require("./base")
    
  ###
  ###

  name: "textBinding"

  ###
  ###

  constructor: (@script) ->
    super()
    @clip = new Clip { script: script, watch: false }

  ###
  ###

  _writeHead: (info, callback) ->
    utils.startBindingBlock @, info
    @clip.reset info.data
    @clip.update()
    v = @clip.get("value")
    if v
      info.buffer.push v

    callback()

  ###
  ###

  _writeTail: (info, callback) ->
    utils.endBindingBlock @, info
    callback()


  ###
  ###

  clone: () -> new TextBinding @script

module.exports = TextBinding