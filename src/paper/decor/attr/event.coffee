class SubmitDecor extends require("./dataBind")

  ###
  ###
  
  watch: false

  ###
  ###

  bind: () ->
    super()
    event = @event or @name
    
    if event.substr(0, 2) is "on"
      event = event.substr(2).toLowerCase()

    $(@element).bind event, @_onEvent

  ###
  ###

  _onEvent: (event) =>

    if @clip.get("propagateEvent") isnt true
      event.stopPropagation()

    return if @clip.get("disable")

    @clip.data.set "event", event
    @_update event

  ###
  ###

  _update: (event) ->
    @script.update()


module.exports = SubmitDecor