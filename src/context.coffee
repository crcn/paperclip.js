dref = require("dref")

class PropertyChain

  constructor: (@context) ->
    @_commands = []

  ref: (path) -> 
    @_commands.push { ref: path }
    @

  call: () -> 
    @_commands.push { call: arguments }
    @

  value: () ->
    cv = undefined
    for command in @_commands
      
      if command.ref
        cv = dref.get command.ref
      else
        cv.call 


      return undefined if not cv








class Context

  ###
  ###

  constructor: () ->


  ###
  ###

  ref: (path) -> new PropertyChain(@context)


module.exports = Context