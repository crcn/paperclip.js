_ = require "underscore"

class ValueDecor extends require("./dataBind")

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
      value = @_elementValue()
      if @clip.get("bothWays")
        for ref in @refs
          @context.set ref, value
    ), 5

  ###
  ###

  _onChange: (value) =>
    @_elementValue value


  ###
  ###

  _elementValue: (value) =>
    isInput = @_isInput()

    unless arguments.length
      return if isInput then @element.value else @element.innerHTML

    @currentValue = value

    if isInput
      @element.value = value
    else
      @element.innerHTML = value




  ###
  ###

  _isInput: () =>
    # allows for contenteditable
    /input/.test @element.nodeName.toLowerCase()





module.exports = ValueDecor