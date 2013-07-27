class DisableDecor extends require("./dataBind")

  ###
  ###

  bind: () ->
    super()
    @$element = $(@element)
    @clip.bind("disable").to(@_show).now()
    @_show @clip.get("disable")

  ###
  ###
  
  _show: (value) => 
    if value
      @$element.attr("disabled", "disabled")
    else
      @$element.removeAttr("disabled", "disabled")


module.exports = DisableDecor