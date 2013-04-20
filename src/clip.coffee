bindable = require "bindable"
dref     = require "dref"
events   = require "events"

class PropertyChain

  constructor: (@clip) ->
    @_commands = []

  ref: (path) ->
    @_commands.push { ref: path }
    @

  call: (path, args) -> 
    @_commands.push { ref: path, args: args }
    @

  value: () ->

    cv = @clip.data

    for command in @_commands

      @clip._watch command.ref, cv
      
      # reference
      if command.ref
        cv = dref.get cv, command.ref

      # function?
      else
        cv = dref.get cv, command.name
        if cv and typeof cv is "function"
          cv = cv?.apply cv, command.args
        else
          cv = undefined

      break if not cv

    return cv



class Clip extends events.EventEmitter
  
  ###
  ###

  constructor: (@options) ->

    @script    = options.script
    @data      = new bindable.Object options.data  or {}
    @modifiers = options.modifiers or {}

    @_watching = {}

    @update()


  ###
  ###

  ref: (path) -> new PropertyChain(@).ref path
  call: (path, args) -> new PropertyChain(@).call path, args

  ###
  ###

  update: () => 
    newValue = @script.call @
    return newValue if newValue is @value
    @emit "change", @value = newValue
    newValue

  ###
  ###

  _watch: (path, target) ->

    if @_watching[path]
      return if @_watching[path].target is target
      @_watching[path].binding.dispose()


    @_watching[path] = {
      target: target
      binding: target.bind(path).watch(true).to(@update)
    }






module.exports = Clip
