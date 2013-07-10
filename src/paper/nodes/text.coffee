
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

  _writeHead: (info) ->
    info.buffer.push @_buffer
    super info

  ###
  ###

  clone: () -> new StringBuilder @_buffer



module.exports = StringBuilder