class ClickDecor extends require("./dataBind")

  ###
  ###

  @scriptName: "click"
  
  ###
  ###
  
  watch: false

  ###
  ###

  bind: () ->
    super()
    $(@element).bind "click", @_onClicked

  ###
  ###

  _onClicked: (event) =>
    @script.update()

module.exports = ClickDecor