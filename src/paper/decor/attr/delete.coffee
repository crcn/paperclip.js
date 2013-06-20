class DeleteDecor extends require("./event")
  
  ###
  ###
  
  event: "keydown"

  ###
  ###

  _onEvent: (event) =>
    return if event.keyCode not in [8]
    super event

module.exports = DeleteDecor