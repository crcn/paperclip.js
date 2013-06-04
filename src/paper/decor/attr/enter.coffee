class EnterDecor extends require("./event")
  
  ###
  ###
  
  event: "keyup"

  ###
  ###

  _update: (event) =>
    return if event.keyCode isnt 13
    super()

module.exports = EnterDecor