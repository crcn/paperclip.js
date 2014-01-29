BindingCollection = require "../collection"
loaf = require("loaf")
Clip                = require "../../../clip"

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

  getNode: () ->
    @options.class.getNode?(@options)

  ###
  ###

  prepare: () ->
    @options.class.prepare?(@options)

  ###
  ###

  init: () ->
    @_path = @path()

  ###
  ###

  getBinding: (templateNode) ->

    cn = templateNode

    while cn.parentNode
      cn = cn.parentNode

    for index in @_path
      cn = cn.childNodes[index]

    clazz = @options.class

    ops = {
      node: cn,
      clip: new Clip({ script: @options.script, watch: false, application: @options.application })
    }

    if @options.section
      ops.section = loaf(@options.section.nodeFactory, cn, cn.nextSibling)


    for key of @options
      continue if ops[key]?
      ops[key] = @options[key]

    new clazz(ops)

  ###
  ###

  path: () ->
    if @_path
      return @_path

    paths = []
    cn = @options.node || @options.section.start
    while cn.parentNode
      children = []
      for child in cn.parentNode.childNodes
        children.push child
      paths.unshift Array.prototype.slice.call(children, 0).indexOf(cn)
      cn = cn.parentNode

    @_path = paths





class Factory

  ###
  ###

  getBinder: (options) ->

    clipScriptNames = if options.script.fn then ["value"] else Object.keys(options.script)

    for scriptName in clipScriptNames
      if bd = bindingClasses[scriptName]
        options.scriptName = scriptName
        options.class = bd
        bd.prepare? options
        return new Binder options


  ###
  ###

  register: (name, bindingClass) ->
    bindingClasses[name] = bindingClass



module.exports = new Factory()