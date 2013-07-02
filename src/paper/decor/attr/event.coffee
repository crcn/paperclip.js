# see http://arantius.com/misc/webref/domref/dom_event_ref33.html
class EventDecor extends require("./dataBind")

  ###
  ###
  
  watch: false

  ###
  ###

  propagateEvent: true

  ###
  ###

  preventDefault: false

  ###
  ###

  bind: () ->
    super()

    # keyup keydown mouseup mousedown 



    event = (@event or @name).toLowerCase()
    name  = @name.toLowerCase()

    if name.substr(0, 2) is "on"
      name = name.substr(2)
    
    if event.substr(0, 2) is "on"
      event = event.substr(2)


    if name in ["click", "mouseup", "mousedown"]
      @preventDefault = true


    @_pge = "propagateEvent." + name
    @_pde = "preventDefault." + name
 
    # set default properties for event modifiers
    for ev in [@_pge, @_pde]
      prop = ev.split(".").shift()
      if not @clip.get(ev)? and @[prop]?
        @clip.set ev, @[prop]

    $(@element).bind event, @_onEvent

  ###
  ###

  _onEvent: (event) =>

    if @clip.get("propagateEvent") isnt true or @clip.get(@_pge) isnt true
      event.stopPropagation()

    if @clip.get("preventDefault") is true or @clip.get(@_pde) is true
      event.preventDefault()

    return if @clip.get("disable")

    @clip.data.set "event", event
    @_update event

  ###
  ###

  _update: (event) ->
    @script.update()


module.exports = EventDecor