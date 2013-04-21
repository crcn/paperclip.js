class Handler extends require("./base")
  
  ###
  ###

  init: () ->
    super()
    @clip.bind("value").to @_onValueChange
    $(@element).bind "keyup change", @_onElementChange

  ###
  ###

  _onValueChange: (value) =>
    @element.value = @currentValue = value

  ###
  ###
  
  _onElementChange: (event) =>
    value = @element.value

    if @clip.get("bothWays")
      for ref in @script.references()
        @clip.data.set ref.toPathString(), value


module.exports = Handler