# see http://arantius.com/misc/webref/domref/dom_event_ref33.html
class EventDecor extends require("./base")

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
    super arguments...

    # keyup keydown mouseup mousedown 
    event = (@event or @name).toLowerCase()
    name  = @name.toLowerCase()

    if name.substr(0, 2) is "on"
      name = name.substr(2)
    
    if event.substr(0, 2) is "on"
      event = event.substr(2)


    @clip.script("propagateEvent")?.update()
    @clip.script("preventDefault")?.update()


    if name in ["click", "mouseup", "mousedown", "submit"]
      @preventDefault = true
      @propagateEvent = false


    @_pge = "propagateEvent." + name
    @_pde = "preventDefault." + name
 
    # set default properties for event modifiers
    for ev in [@_pge, @_pde]
      prop = ev.split(".").shift()
      if not @clip.get(ev)? and not @clip.get(prop)? and @[prop]?
        @clip.set ev, @[prop]

    (@$node = $(@node)).bind @_event = event, @_onEvent

  ###
  ###

  unbind: () ->
    super()
    @$node.unbind @_event, @_onEvent


  ###
  ###

  _onEvent: (event) =>

    if @clip.get("propagateEvent") isnt true and @clip.get(@_pge) isnt true
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