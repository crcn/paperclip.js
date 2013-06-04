_ = require "underscore"
ChangeDecor = require("./change")

class ValueDecor extends require("./dataBind")

  ###
  ###

  bind: () ->
    super()
    $(@element).bind ChangeDecor.events, @_onElementChange
    @_onChange @clip.get("value")
  

  ###
  ###

  _onElementChange: (event) =>

    event.stopPropagation()
    clearTimeout @_changeTimeout
    # need to delay so that the input value can catch up
    @_changeTimeout = setTimeout (() =>
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
    isInput = @element.hasOwnProperty "value"

    unless arguments.length
      return if isInput then @_checkedOrValue() else @element.innerHTML

    @currentValue = value

    if isInput
      @_checkedOrValue value
    else
      @element.innerHTML = value



  ###
  ###

  _checkedOrValue: (value) ->
    isCheckbox = /checkbox/.test @element.type

    unless arguments.length
      return if isCheckbox then @element.checked else @element.value

    if isCheckbox
      @element.checked = value
    else 
      @element.value = value





module.exports = ValueDecor