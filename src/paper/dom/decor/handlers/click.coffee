
class Handler extends require("./base")
  
  ###
  ###
  
  watch: false

  ###
  ###

  init: () ->
    $(@element).bind "click", @_onClicked

  ###
  ###

  _onClicked: (event) =>
    @script.update()

module.exports = Handler