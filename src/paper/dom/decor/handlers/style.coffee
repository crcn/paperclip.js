class Handler extends require("./base")
  
  ###
  ###

  init: () ->
    super()
    @_currentStyles = {}
    @$element = $(@element)
    @clip.bind("style").to @_updateStyle

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


module.exports = Handler