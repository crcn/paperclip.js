_ = require "underscore"
ChangeDecor  = require("./change")
type         = require "type-component"
dref = require "dref"

class ModelAttrBinding extends require("./base")

  ###
  ###

  bind: () ->

    # poll for changes in the input field
    @_autocompleteCheckInterval = setInterval (() =>
      @_onElementChange()
    ), 500

    super arguments...
    (@$element = $(@node)).bind ChangeDecor.events, @_onElementChange
    @_onChange()
    @_nameBinding = @clip.data.bind "name", @_onChange
  

  ###
  ###

  _onElementChange: (event) =>

    event?.stopPropagation()
    clearTimeout @_changeTimeout
    # need to delay so that the input value can catch up

    applyChange = () =>
      value = @_parseValue @_elementValue()
      name  = @_elementName()
      refs  = @script.script.refs
      model = @clip.get("model")

      # assumed, but can be overridden
      if @clip.get("bothWays") isnt false
        ref = name or (if refs.length then refs[0] else undefined)

        unless name
          model = @context

        @currentValue = value

        if model
          if model.set
            model.set ref, value
          else
            dref.set model, ref, value


    unless process.browser
      applyChange()
    else
      @_changeTimeout = setTimeout applyChange, 5

    

  ###
  ###

  unbind: () ->
    super()
    clearInterval @_autocompleteCheckInterval
    @_modelBinding?.dispose()
    @_nameBinding?.dispose()
    @$element.unbind ChangeDecor.events, @_onElementChange

  ###
  ###

  _onChange: () =>
    model = @clip.get("model")
    #@_elementValue if type(value) is "string" then escapeHTML(value) else value

    name = @_elementName()
    @_modelBinding?.dispose()

    
    if name
      @_modelBinding = model?.bind(name, @_onValueChange).now()
    else if type(model) isnt "object"
      @_onValueChange model


  ###
  ###

  _onValueChange: (value) =>
    @_elementValue @_parseValue value

  ###
  ###

  _parseValue: (value) ->
    return undefined if not value? or value is ""

    if type(value) isnt "string"
      return value

    if isNaN(v = Number(value)) or (String(value).substr(0, 1) is "0" and String(value).length > 1)
      return value
    else
      return v


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

    return if @currentValue is value
    
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
      if isCheckbox
        return Boolean $(@node).is(":checked")
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
