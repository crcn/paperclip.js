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

    # keep track of the previous display state so that we can reset
    # it on display - might be something like: block, inline-block, etc.
    unless @_displayStyle
      @_displayStyle = @$element.css "display"

    # on display, show the original display state.
    @$element.css { "display": if value then @_displayStyle else "none" }


module.exports = ShowDecor