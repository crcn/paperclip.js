class ShowDecor extends require("./dataBind")
  
  ###
  ###
  
  bind: () ->
    super()
    @$element = $(@element)
    @clip.bind("show").to(@_show).now()
    @_show @clip.get("show")

  ###
  ###

  _show: (value) => 
    unless @_displayStyle
      @_displayStyle = @$element.css "display"
    @$element.css { "display": if value then @_displayStyle else "none" }


module.exports = ShowDecor