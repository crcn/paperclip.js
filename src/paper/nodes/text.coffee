
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

  _writeHead: (writer) ->
    @target = writer.createTextNode @_buffer
    super info

  ###
  ###

  clone: () -> new TextBuilder @_buffer

  ###
  ###

  createNode: (writer) -> writer.createTextNode @_buffer



module.exports = TextBuilder