
class StringBuilder extends require("./base")
  
  ###
  ###

  name: "string"

  ###
  ###

  constructor: (buffer = "") -> 
    @_buffer = buffer

  ###
  ###

  _writeHead: (info, callback) ->
    info.buffer.push @_buffer
    super info, callback



  ###
  ###

  clone: () -> new StringBuilder @_buffer



module.exports = StringBuilder