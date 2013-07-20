
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

  clone: () -> new TextBuilder @_buffer

  ###
  ###

  createNode: (nodeFactory) -> nodeFactory.createTextNode @_buffer



module.exports = (buffer) -> new TextBuilder buffer