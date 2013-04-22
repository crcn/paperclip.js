class Handler extends require("./base")
  
  ###
  ###

  init: () ->
    super()
    @clip.bind("value").to @_onValueChange
    $(@element).bind "keydown keyup change", @_onElementChange

  ###
  ###

  _onValueChange: (value) =>
    @element.value = @currentValue = value

  ###
  ###

  _onElementChange: (event) =>

    # need to delay so that the input value can catch up
    setTimeout (() =>
      value = @element.value
      if @clip.get("bothWays")
        for ref in @script.references()
          @clip.data.set ref.toPathString(), value
    ), 5



module.exports = Handler