_ = require "underscore"

class ValueDecor extends require("./dataBind")
  
  ###
  ###

  @scriptName: "value"

  ###
  ###

  bind: () ->
    super()
    $(@element).bind "keydown change input", _.debounce @_onElementChange, 1
    @_onChange @clip.get("value")
  

  ###
  ###

  _onElementChange: (event) =>
    
    # need to delay so that the input value can catch up
    setTimeout (() =>
      value = @element.value
      if @clip.get("bothWays")
        for ref in @refs
          @context.set ref, value
    ), 5

  ###
  ###

  _onChange: (value) =>
    @element.value = @currentValue = value





module.exports = ValueDecor