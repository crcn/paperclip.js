
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
    info.buffer.push @_buffer
    super info

  ###
  ###

  clone: () -> new TextBuilder @_buffer



module.exports = StringBuilder