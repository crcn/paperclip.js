class Handler extends require("./base")
  
  ###
  ###

  init: () ->
    super()
    @$element = $(@element)
    @clip.bind("checked").to @_show

  ###
  ###
  
  _show: (value) => 
    @element.checked = value


module.exports = Handler