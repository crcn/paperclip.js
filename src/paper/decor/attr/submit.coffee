class SubmitDecor extends require("./dataBind")

  ###
  ###
  
  watch: false

  ###
  ###

  bind: () ->
    super()
    $(@element).bind "submit", @_onSubmitted

  ###
  ###

  _onSubmitted: (event) =>
    @script.update()

module.exports = SubmitDecor