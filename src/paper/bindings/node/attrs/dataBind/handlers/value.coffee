_ = require "underscore"
ChangeDecor = require("./change")
type = require "type-component"

###
 DEPRECATED - USE MODEL
###

class ValueAttrBinding extends require("./base")

  ###
  ###

  bind: () ->
    super()
    (@$element = $(@node)).bind ChangeDecor.events, @_onElementChange
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
        @_currentValue = value
        for ref in @refs
          @context.set ref, value
      return
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
    isInput = Object.prototype.hasOwnProperty.call(@node, "value") or /input|textarea|checkbox/.test(@node.nodeName.toLowerCase())

    unless arguments.length
      return if isInput then @_checkedOrValue() else @node.innerHTML

    @currentValue = value

    if isInput
      @_checkedOrValue value
    else
      @node.innerHTML = value



  ###
  ###

  _checkedOrValue: (value) ->
    isCheckbox = /checkbox/.test @node.type

    unless arguments.length
      return if isCheckbox then @node.checked else @node.value

    if isCheckbox
      @node.checked = value
    else 
      @node.value = value



module.exports = ValueAttrBinding
