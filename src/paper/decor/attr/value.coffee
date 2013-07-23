_ = require "underscore"
ChangeDecor = require("./change")
escapeHTML = require("../../utils/escapeHTML")
type = require "type-component"

###
 DEPRECATED - USE MODEL
###

class ValueDecor extends require("./dataBind")

  ###
  ###

  bind: () ->
    super()
    (@$element = $(@element)).bind ChangeDecor.events, @_onElementChange
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

  dispose: () ->
    @$element?.unbind ChangeDecor.events, @_onElementChange

  ###
  ###

  _onChange: (value) =>
    #@_elementValue if type(value) is "string" then escapeHTML(value) else value
    @_elementValue value


  ###
  ###

  _elementValue: (value) =>

    # cannot be undefined
    unless value?
      value = ""

    # Object.prototype.hasOwnProperty is a work-around for ffox and, ie
    isInput = Object.prototype.hasOwnProperty.call(@element, "value") or /input|textarea|checkbox/.test(@element.nodeName.toLowerCase())

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