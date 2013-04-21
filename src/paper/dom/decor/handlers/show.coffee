class Handler extends require("./base")

  ###
  ###
  
  init: () ->
    super()
    @$element = $(@element)
    @clip.bind("show").to @_show
    @_show @clip.get("show")

  ###
  ###

  _show: (value) => 
    @$element.css { "display": if value then "block" else "none" }


module.exports = Handler