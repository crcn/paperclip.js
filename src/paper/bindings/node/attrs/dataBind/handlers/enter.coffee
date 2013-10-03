class EnterAttrBinding extends require("./event")
  
  ###
  ###
  
  event: "keydown"

  ###
  ###

  preventDefault: true

  ###
  ###

  _onEvent: (event) =>
    return if event.keyCode isnt 13
    super event

module.exports = EnterAttrBinding