BindingCollection = require "../collection"

bindingClasses = 
  html : require("./html")
  when : require("./when")
  value: require("./value")


class Factory

  ###
  ###

  getBindings: (section, clip, nodeFactory) ->

    bindings = []

    for scriptName in clip.scripts.names
      if bd = bindingClasses[scriptName]
        bindings.push new bd section, clip, nodeFactory, scriptName

    bindings

  ###
  ###

  register: (name, bindingClass) ->
    bindingClasses[name] = bindingClass



module.exports = new Factory()