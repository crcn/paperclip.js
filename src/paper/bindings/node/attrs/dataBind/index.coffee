Clip = require "../../../../../clip"
BindingCollection = require "../../../collection"

dataBindingClasses = 
  show: require("./handlers/show")
  css: require("./handlers/css")
  style: require("./handlers/style")
  disable: require("./handlers/disable")

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
