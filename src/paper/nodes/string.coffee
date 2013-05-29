
class StringBuilder extends require("./base")
  
  ###
  ###

  name: "string"

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