class TextWriter extends require("./base")

  ###
  ###

  write: (text) => @nodeFactory.createTextNode text



module.exports = TextWriter