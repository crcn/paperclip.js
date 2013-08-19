_ = require "underscore"
ChangeDecor  = require("./change")
type         = require "type-component"
dref = require "dref"

class ModelAttrBinding extends require("./base")

  ###
  ###

  bind: () ->
    super()
    (@$element = $(@node)).bind ChangeDecor.events, @_onElementChange
    @_onChange @clip.get("model")
  

  ###
  ###

  _onElementChange: (event) =>

    event.stopPropagation()
    clearTimeout @_changeTimeout
    # need to delay so that the input value can catch up
    @_changeTimeout = setTimeout (() =>

      value = @_parseValue @_elementValue()
      name  = @_elementName()
      refs  = @script.script.refs
      model = @clip.get("model")

      # assumed, but can be overridden
      if @clip.get("bothWays") isnt false
        ref = name or (if refs.length then refs[0] else undefined)

        unless name
          model = @context

        if model
          if model.set
            model.set ref, value
          else
            dref.set model, ref, value


    ), 5

  ###
  ###

  dispose: () ->
    @_modelBinding?.dispose()
    @$element?.unbind ChangeDecor.events, @_onElementChange

  ###
  ###

  _onChange: (model) =>
    #@_elementValue if type(value) is "string" then escapeHTML(value) else value

    name = @_elementName()
    @_modelBinding?.dispose()

    if name
      @_modelBinding = model?.bind(name).to(@_onValueChange).now()
    else
      @_onValueChange model


  ###
  ###

  _onValueChange: (value) =>
    @_elementValue @_parseValue value

  ###
  ###

  _parseValue: (value) ->
    return undefined if not value? or value is ""
    if isNaN v = Number(value) then value else v


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

  _elementName: () -> $(@node).attr("name")

  ###
  ###

  _checkedOrValue: (value) ->

    isCheckbox        = /checkbox/.test @node.type
    isRadio           = /radio/.test @node.type
    isRadioOrCheckbox = isCheckbox or isRadio

    unless arguments.length
      if isRadioOrCheckbox
        return $(@node).val()
      else
        return @node.value

    if isRadioOrCheckbox
      if isRadio
        if String(value) is String($(@node).val())
          $(@node).prop("checked", true)
      else
        @node.checked = value
    else 
      @node.value = value





module.exports = ModelAttrBinding