class Handler extends require("./base")

  ###
  ###

  init: () ->
    super()
    @$element = $(@element)
    @clip.bind("disable").to @_show
    @_show @clip.get("disable")

  ###
  ###
  
  _show: (value) => 
    if value
      @$element.attr("disabled", "disabled")
    else
      @$element.removeAttr("disabled", "disabled")


module.exports = Handler