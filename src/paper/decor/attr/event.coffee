class SubmitDecor extends require("./dataBind")

  ###
  ###
  
  watch: false

  ###
  ###

  bind: () ->
    super()
    event = @name
    
    if event.substr(0, 2) is "on"
      event = event.substr(2).toLowerCase()

    $(@element).bind event, @_onSubmitted

  ###
  ###

  _onSubmitted: (event) =>
    event.preventDefault()
    @clip.data.set "event", event
    @script.update()

module.exports = SubmitDecor