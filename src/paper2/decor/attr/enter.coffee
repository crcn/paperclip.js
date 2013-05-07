class EnterDecor extends require("./dataBind")
    
  ###
  ###

  @scriptName: "enter"

  ###
  ###

  watch: false

  ###
  ###

  bind: () ->
    super()
    $(@element).bind "keyup", @_onKeyUp

  ###
  ###

  _onKeyUp: (event) =>
    return if event.keyCode isnt 13
    @script.update()

module.exports = EnterDecor