BindingCollection = require "../collection"

bindingClasses = 
  html   : require("./html")
  if     : require("./conditional")
  else   : require("./conditional")
  elseif : require("./conditional")
  value  : require("./value")


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

  register: (name, bindingClass) ->
    bindingClasses[name] = bindingClass



module.exports = new Factory()