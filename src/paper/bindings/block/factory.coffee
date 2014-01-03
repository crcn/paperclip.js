BindingCollection = require "../collection"
loaf = require("loaf")
Clip                = require "../../../clip"
_ = require("underscore")

bindingClasses = 
  html   : require("./html")
  if     : require("./conditional")
  else   : require("./conditional")
  elseif : require("./conditional")
  value  : require("./value")




class Binder

  ###
  ###

  constructor: (@options) ->

  ###
  ###

  getBinding: (templateNode) ->

    cn = templateNode

    while cn.parentNode
      cn = cn.parentNode

    for index in @path()
      cn = cn.childNodes[index]

    clazz = @options.class


    new clazz(_.extend({}, @options, {
      section: loaf(@options.section.nodeFactory, cn, cn.nextSibling),
      clip: new Clip({ script: @options.script, watch: false })
    }))

  ###
  ###

  path: () ->
    if @_path
      return @_path

    paths = []
    cn = @options.section.start
    while cn.parentNode
      paths.unshift Array.prototype.slice.call(cn.parentNode.childNodes, 0).indexOf(cn)
      cn = cn.parentNode



    @_path = paths





class Factory

  ###
  ###

  getBindings: (options) ->

    bindings = []

    clipScriptNames = options.clip.scripts.names

    for scriptName in clipScriptNames
      if bd = bindingClasses[scriptName]
        options.scriptName = scriptName
        bindings.push new bd options

    bindings

  ###
  ###

  getBinders: (options) ->

    binders = []

    clipScriptNames = if options.script.fn then ["value"] else Object.keys(options.script)

    for scriptName in clipScriptNames
      if bd = bindingClasses[scriptName]
        options.scriptName = scriptName
        options.class = bd
        bd.prepare? options
        binders.push new Binder options

    binders

  ###
  ###

  register: (name, bindingClass) ->
    bindingClasses[name] = bindingClass



module.exports = new Factory()