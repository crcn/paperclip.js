class ChangeDecor extends require("./event")
  
  ###
  ###
  
  event: "keydown change input"

  ###
  ###


  _update: (event) ->
    clearTimeout @_changeTimeout
    @_changeTimeout = setTimeout @_update2, 5

  ###
  ###

  _update2: () ->
    @script.update()
