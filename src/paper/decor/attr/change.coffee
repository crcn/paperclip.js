class ChangeDecor extends require("./event")

  ###
  ###

  @events: "keydown change input mousedown mouseup click"
  
  ###
  ###

  event: @events

  ###
  ###


  _update: (event) ->
    clearTimeout @_changeTimeout
    @_changeTimeout = setTimeout @_update2, 5

  ###
  ###

  _update2: () ->
    @script.update()
