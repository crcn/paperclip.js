Clip = require "../../../../../clip"
BindingCollection = require "../../../collection"

dataBindingClasses = 
  show    : require("./handlers/show")
  css     : require("./handlers/css")
  style   : require("./handlers/style")

  # deprecated for enable
  disable : require("./handlers/disable")
  enable  : require("./handlers/enable")
  model   : require("./handlers/model")

  click      : require("./handlers/event")
  submit     : require("./handlers/event")
  mousedown  : require("./handlers/event")
  mouseup    : require("./handlers/event")
  mouseover  : require("./handlers/event")
  mouseout   : require("./handlers/event")
  keydown    : require("./handlers/event")
  keyup      : require("./handlers/event")
  enter      : require("./handlers/enter")
  delete     : require("./handlers/delete")

  onClick      : require("./handlers/event")
  onLoad       : require("./handlers/event")
  onSubmit     : require("./handlers/event")
  onMouseDown  : require("./handlers/event")
  onMouseUp    : require("./handlers/event")
  onMouseOver  : require("./handlers/event")
  onMouseOut   : require("./handlers/event")
  onKeyDown    : require("./handlers/event")
  onKeyUp      : require("./handlers/event")
  onEnter      : require("./handlers/enter")
  onChange     : require("./handlers/change")
  onDelete     : require("./handlers/delete")

class AttrDataBinding extends require("../../base")
  
  ###
  ###

  type: "attr"

  ###
  ###

  constructor: (options) ->
    super options

    @clip = new Clip { scripts: options.value[0], watch: false, application: options.application }

    @_bindings = new BindingCollection()

    for scriptName in @clip.scripts.names
      continue unless (bc = dataBindingClasses[scriptName])
      @_bindings.push new bc options.application, @node, @clip, scriptName

  ###
  ###

  bind: (@context) ->
    @clip.reset(@context, false)
    @_bindings.bind @context

  ###
  ###

  unbind: () ->
    @_bindings.unbind()
    @clip.dispose()



module.exports = AttrDataBinding
module.exports.register = (name, dataBindClass) ->
  dataBindingClasses[name] = dataBindClass
