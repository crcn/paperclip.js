class StringBuilder extends require("./base")
    
  ###
  ###
  
  type: "string"

  ###
  ###

  constructor: (buffer = "") -> 
    @_buffer = buffer


  ###
  ###

  write: (info, callback) ->
    info.buffer.push @_buffer
    callback()

  ###
  ###

  clone: () -> new StringBuilder @_buffer



module.exports = StringBuilder