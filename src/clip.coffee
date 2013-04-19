dref = require("dref")
bindable = require "bindable"

class PropertyChain

  constructor: (@clip) ->
    @_commands = []

  ref: (path) -> 
    @_commands.push { ref: path }
    @

  call: (path, args) -> 
    @_commands.push { name: path, args: args }
    @

  value: () ->
    cv = @clip.data
    for command in @_commands
      
      if command.ref
        cv = dref.get cv, command.ref
      else
        cv = dref.get cv, command.name
        cv?.call cv, command.args

      break if not cv

    return cv


class Clip

  ###
  ###

  constructor: (data = {}) ->
    @data = new bindable.Object data


  ###
  ###

  bind: (property, to) -> @data.bind arguments...



  ###
  ###

  ref: (path) -> new PropertyChain(@data).ref path


module.exports = Clip