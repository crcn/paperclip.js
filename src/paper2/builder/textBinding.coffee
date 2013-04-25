Clip = require "../../clip"

class TextBinding extends require("./bindable")
  
  ###
  ###

  type: "text"
  
  ###
  ###

  constructor: (@script) ->
    super()
    @clip = new Clip { script: script, watch: false }

  ###
  ###

  _writeHead: (info, callback) ->
    @_bindingStart info
    @clip.reset info.data
    @clip.update()
    v = @clip.get("value")
    if v
      info.buffer.push v

    callback()

  ###
  ###

  _writeTail: (info, callback) ->
    @_bindingEnd info
    callback()

  ###
  ###

  clone: () -> new TextBinding @script

module.exports = TextBinding