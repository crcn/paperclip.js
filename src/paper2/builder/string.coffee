class String extends require("./base")

  ###
  ###

  constructor: (buffer = "") -> 
    @_buffer = buffer


  ###
  ###

  write: (info, callback) ->
    info.buffer.push @_buffer
    callback()

module.exports = String