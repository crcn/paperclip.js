class CssDecor extends require("./dataBind")

  ###
  ###

  bind: () ->
    super()
    @_currentClasses = {}
    @$element = $(@element)
    @clip.bind("css").to @_updateCss

  ###
  ###
  
  _updateCss: (classes) => 
    for className of classes
      useClass = classes[className]
      if useClass
        if not @_currentClasses[className]
          @_currentClasses[className] = 1

          @$element.addClass className
      else
        if @_currentClasses[className]
          delete @_currentClasses[className]
          @$element.removeClass className


module.exports = CssDecor