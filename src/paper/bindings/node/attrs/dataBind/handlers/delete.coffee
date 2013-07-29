class DeleteAttrBinding extends require("./event")
  
  ###
  ###
  
  event: "keydown"

  ###
  ###

  preventDefault: true

  ###
  ###

  _onEvent: (event) =>
    return if event.keyCode not in [8]
    super event

module.exports = DeleteAttrBinding