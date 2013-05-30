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
    @$element.css { "display": if value then "block" else "none" }


module.exports = ShowDecor