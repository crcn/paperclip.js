class StyleDecor extends require("./dataBind")

  
  ###
  ###

  bind: () ->
    super()
    @_currentStyles = {}
    @$element = $(@element)
    @clip.bind("style").to(@_updateStyle).now()

  ###
  ###
  
  _updateStyle: (styles) =>
    newStyles = {}
    hasNew = false

    for name of styles
      style = styles[name]
      if style isnt @_currentStyles[name]
        newStyles[name] = @_currentStyles[name] = style
        hasNew = true


    if hasNew
      @$element.css newStyles


module.exports = StyleDecor