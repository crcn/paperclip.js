Clip = require "../../../../../clip"
BindingCollection = require "../../../collection"

dataBindingClasses = 
  show    : require("./handlers/show")
  css     : require("./handlers/css")
  style   : require("./handlers/style")
  disable : require("./handlers/disable")

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

###

  css     : require("./attr/css")
  show    : require("./attr/show")
  style   : require("./attr/style")
  value   : require("./attr/value")
  model   : require("./attr/model")

  # deprecated
  click      : require("./attr/event")
  submit     : require("./attr/event")
  mousedown  : require("./attr/event")
  mouseup    : require("./attr/event")
  mouseover  : require("./attr/event")
  mouseout   : require("./attr/event")
  keydown    : require("./attr/event")
  keyup      : require("./attr/event")
  enter      : require("./attr/enter")
  delete     : require("./attr/delete")

  onClick      : require("./attr/event")
  onSubmit     : require("./attr/event")
  onMouseDown  : require("./attr/event")
  onMouseUp    : require("./attr/event")
  onMouseOver  : require("./attr/event")
  onMouseOut   : require("./attr/event")
  onKeyDown    : require("./attr/event")
  onKeyUp      : require("./attr/event")
  onEnter      : require("./attr/enter")
  onChange     : require("./attr/change")
  onDelete     : require("./attr/delete")

  disable : require("./attr/disable")
  checked : require("./attr/checked")
###

class AttrDataBinding extends require("../base")
  
  ###
  ###

  type: "attr"

  ###
  ###

  constructor: (options) ->
    super options

    @clip = new Clip { scripts: options.value[0], watch: false }

    @_bindings = new BindingCollection()

    for scriptName in @clip.scripts.names
      continue unless (bc = dataBindingClasses[scriptName])
      @_bindings.push new bc @node, @clip, scriptName



  ###
  ###

  bind: (@context) ->
    @clip.watch().reset(@context)
    @_bindings.bind()

  ###
  ###

  unbind: () ->
    @clip.unwatch()
    @_bindings.unbind()



module.exports = AttrDataBinding
module.exports.register = (name, dataBindClass) ->
  dataBindingClasses[name] = dataBindClass
