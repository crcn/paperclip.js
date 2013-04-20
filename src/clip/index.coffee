bindable = require "bindable"
dref     = require "dref"
events   = require "events"
defaultModifiers = require "./modifiers"

###
 Reads a property chain 
###

class PropertyChain

  __isPropertyChain: true

  constructor: (@watcher) ->
    @_commands = []
    @clip = @watcher.clip

  ref: (path) ->
    @_commands.push { ref: path }
    @

  path: () ->
    path = []
    for c in @_commands
      path.push c.ref

    path.join(".")


  self: (path) ->
    @_self = true
    @ref path
    @

  call: (path, args) -> 
    @_commands.push { ref: path, args: args }
    @

  exec: () ->
    @currentValue = @value()
    @

  value: (value) ->
    hasValue = arguments.length

    cv = if @_self then @clip else @clip.data
    n = @_commands.length

    for command, i in @_commands

      @watcher._watch command.ref, cv

      if i is n-1 and hasValue
        if cv.set then cv.set(command.ref, value) else dref.set cv, command.ref, value

      cv = if cv.get then cv.get(command.ref) else dref.get cv, command.ref
      
      # reference
      if command.args
        if cv and typeof cv is "function"
          cv = cv?.apply cv, command.args
        else
          cv = undefined

      break if not cv

    #modifier(ref.value(), modifier(anotherRef.value()))
    @watcher.currentRef = @

    return cv


class ScriptWatcher extends events.EventEmitter

  ###
  ###

  constructor: (@script, @clip) ->
    @modifiers = @clip.modifiers
    @defaultModifiers = defaultModifiers
    @options = @clip.options
    @_watching = {}

  ###
  ###

  dispose: () ->
    for key of @_watching
      @_watching[key].binding.dispose()

    @_watching = {}

  ###
  ###

  update: () =>
    newValue = @script.call @
    return newValue if newValue is @value
    @emit "change", @value = newValue
    newValue


  ###
  ###

  modify: (modifier, args) ->
    @currentRefs = args.filter (arg) -> arg.__isPropertyChain
    modifier.apply @, args.map (arg) ->
      if arg.__isPropertyChain 
        arg.value()
      else
        arg


  ref: (path) -> new PropertyChain(@).ref path
  self: (path) -> new PropertyChain(@).self path
  call: (path, args) -> new PropertyChain(@).call path, args



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



class ClipWatchers

  ###
  ###

  constructor: (@clip, scripts) ->
    @_watchers = {}
    @_bindScripts scripts

  ###
  ###

  dispose: () ->
    for key of @_watchers
      @_watchers[key].dispose()

    @_watchers = {}

  ###
  ###

  _bindScripts: (scripts) ->
    if typeof scripts is "function"
      @_bindScript "value", scripts
    else
      for scriptName of scripts
        @_bindScript scriptName, scripts[scriptName]

  ###
  ###

  _bindScript: (name, script) ->
    watcher = new ScriptWatcher script, @clip
    @_watchers[name] = watcher
    watcher.on "change", (value) =>
      @clip.set name, value

    watcher.update()




class Clip
  
  ###
  ###

  constructor: (@options) ->
    @_self = new bindable.Object()
    @data = new bindable.Object options.data  or {}
    @modifiers = options.modifiers or {}

    if @options.script
      @_watchers = new ClipWatchers @, @options.script

  dispose: () -> 
    @_self?.dispose()
    @_watchers?.dispose()
    @_self     = undefined
    @_watchers = undefined

  get  : () -> @_self.get arguments...
  set  : () -> @_self.set arguments...
  bind : () -> @_self.bind arguments...


module.exports = Clip
module.exports.Watchers  = ClipWatchers
module.exports.modifiers = defaultModifiers
module.exports.compile   = require "./compile"
