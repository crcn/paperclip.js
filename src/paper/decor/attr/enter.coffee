class EnterDecor extends require("./event")
  
  ###
  ###
  
  event: "keydown"

  ###
  ###

  _onEvent: (event) =>
    return if event.keyCode isnt 13
    super event

module.exports = EnterDecor