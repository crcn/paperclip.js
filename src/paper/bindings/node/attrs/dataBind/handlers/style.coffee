class StyleDecor extends require("./base")

  
  ###
  ###

  bind: () ->
    @_currentStyles = {}
    super arguments...

  ###
  ###
  
  _onChange: (styles) ->

    newStyles = {}
    rmStyle   = {}

    for name of styles
      style = styles[name]
      if style isnt @_currentStyles[name]
        newStyles[name] = @_currentStyles[name] = style or ""


    if typeof window is "undefined"
      for key of newStyles
        # blank string effectively removes styles
        @node.style[key] = newStyles[key]
    else
      $(@node).css newStyles

    return



module.exports = StyleDecor