
class TextBuilder extends require("./base")
  
  ###
  ###

  name: "text"

  ###
  ###

  constructor: (buffer = "") -> 
    @_buffer = buffer
    super()

  ###
  ###

  _writeHead: (stream) ->
    @target = stream.createTextNode @_buffer
    super info

  ###
  ###

  clone: () -> new TextBuilder @_buffer



module.exports = StringBuilder