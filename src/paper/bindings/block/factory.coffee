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

    new BindingCollection section, bindings, clip


module.exports = new Factory()