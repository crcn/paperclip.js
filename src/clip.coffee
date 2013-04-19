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
        cv = cv?.apply cv, command.args

      break if not cv

    return cv


class Clip

  ###
  ###

  constructor: (data = {}, options = {}) ->
    @data      = new bindable.Object data
    @modifiers = options.modifiers or {}


  ###
  ###

  bind: (property, to) -> @data.bind arguments...

  ###
  ###

  ref: (path) -> new PropertyChain(@data).ref path
  call: (path, args) -> new PropertyChain(@data).call path, args




module.exports = Clip