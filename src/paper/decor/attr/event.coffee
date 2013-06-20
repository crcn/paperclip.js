# see http://arantius.com/misc/webref/domref/dom_event_ref33.html
class EventDecor extends require("./dataBind")

  ###
  ###
  
  watch: false

  ###
  ###

  propagateEvent: false

  ###
  ###

  preventDefault: true

  ###
  ###

  bind: () ->
    super()

    # keyup keydown mouseup mousedown 

    if @name in ["click", "mouseup", "mousedown"]
      @preventDefault = true


    # set default properties for event modifiers
    for ev in ["propagateEvent", "preventDefault"]
      if not @clip.get(ev)? and @[ev]?
        @clip.set ev, @[ev]


    event = @event or @name
    
    if event.substr(0, 2) is "on"
      event = event.substr(2).toLowerCase()

    $(@element).bind event, @_onEvent

  ###
  ###

  _onEvent: (event) =>

    if @clip.get("propagateEvent") is false
      event.stopPropagation()

    if @clip.get("preventDefault") is true
      event.preventDefault()

    return if @clip.get("disable")

    @clip.data.set "event", event
    @_update event

  ###
  ###

  _update: (event) ->
    @script.update()


module.exports = EventDecor