dref             = require "dref"
events           = require "events"
bindable         = require "bindable"
type             = require "type-component"

###
 Reads a property chain 
###

class PropertyChain
  
  ###
  ###

  __isPropertyChain: true

  ###
  ###

  constructor: (@watcher) ->
    @_commands = []
    @clip = @watcher.clip

  ###
  ###

  ref: (path) ->
    @_commands.push { ref: path }
    @

  ###
  ###

  castAs: (name) ->
    @watcher.cast[name] = @
    @

  ###
  ###

  path: () ->
    path = []
    for c in @_commands
      path.push c.ref

    path.join(".")

  ###
  ###

  self: (path) ->
    @_self = true
    @ref path
    @

  ###
  ###

  call: (path, args) -> 
    @_commands.push { ref: path, args: args }
    @

  ###
  ###

  exec: () ->
    @currentValue = @value()
    @

  ###
  ###

  value: (value) ->
    hasValue = arguments.length

    cv = if @_self then @clip else @clip.data
    n = @_commands.length

    for command, i in @_commands

      @watcher._watch command.ref, cv, !!command.args

      if i is n-1 and hasValue
        if cv.set then cv.set(command.ref, value) else dref.set cv, command.ref, value

      pv = cv
      cv = if cv.get then cv.get(command.ref) else dref.get cv, command.ref

      
      # reference
      if command.args
        if cv and typeof cv is "function"
          cv = cv?.apply pv, command.args
        else
          cv = undefined

      break if not cv

    #modifier(ref.value(), modifier(anotherRef.value()))
    @watcher.currentRef = @

    return cv


###
###

class ClipScript extends events.EventEmitter

  ###
  ###

  constructor: (@script, @clip) ->
    @modifiers = @clip.modifiers
    @options = @clip.options
    @_watching = {}
    @cast = {}
    @_fnSpies = []

  ###
  ###

  dispose: () ->
    for key of @_watching
      @_watching[key].dispose()
    @_fnSpies = []
    @_watching = {}

  ###
  ###

  update: () =>
    newValue = @script.fn.call @
    return newValue if newValue is @value
    @_updated = true
    @emit "change", @value = newValue
    newValue

  ###
  ###

  watch: () ->
    @__watch = true
    @update()
    @

  ###
  ###

  references: () ->  
    # will happen with inline bindings
    return [] if not @script.refs 

  ###
  ###

  ref    : (path) -> new PropertyChain(@).ref path
  self   : (path) -> new PropertyChain(@).self path
  call   : (path, args) -> new PropertyChain(@).call path, args
  castAs : (name) -> new PropertyChain(@).castAs name

  ###
  ###

  _watch: (path, target, isFn) ->

    return if not @__watch

    if @_watching[path]
      return if @_watching[path].target is target
      @_watching[path].dispose()


    @_watching[path] = 
      target  : target
      binding : binding = target.bind(path).to((value, oldValue) =>

        # watches for any changes in the bindable object
        return @_watchBindable(value, oldValue) if value?.__isBindable

        # temporarily overwrites the function so it can see what values to reference
        return @_spyFunction(path, value, target) if type(value) is "function"
      ).now().to(@update)
      dispose : () ->
        binding.dispose()
    


  ###
  ###

  _watchBindable: (value, oldValue) ->

    value.on "change", onChange = () =>
      return if not @_updated
      @_debounceUpdate()

    disposeBinding: () =>
      value.off "change", onChange

  ### 
   temporarily overwrites an existing, referenced function, and finds *all* the references
   called within the given function. This is needed incase a function is called inline, and *might*
   be updated. For example:

   getSum = () -> @get("someNum") + @get("anotherNum")

   and 

   {{ getSum() }}

   _spyFunction would find the references to "someNum", and "anotherSum", and listen for *those* to change,
   then re-call getSum()

  ###

  _spyFunction: (path, fn, target) ->
    oldFn = fn

    # if the function is a spying function, OR the function
    # has already been computed, then ignore it.
    return if fn.__isCallSpy or ~@_fnSpies.indexOf fn

    # store a reference to the original function so it's never spied on again
    @_fnSpies.push fn
    
    self = @

    # need to fetch the owner of the function so proper items are 
    # references
    target = target.owner?(path) or target

    fn = () ->
      refs   = []
      oldGet = @get

      # override this.get temporarily
      @get = (key) ->
        refs.push(key) if key and key.length
        oldGet.call @, key

      # call the old function
      oldFn.apply @, argumentes

      # reset the old this.get function
      @get = oldGet

      #reset the old function
      @set path, oldFn

      for ref in refs
        self._watch ref, @

    # set callspy to the overridden function, since _spyFunction
    # will be called again after it's overridden. We want to prevent an infinite loop!
    fn.__isCallSpy = true

    # override the old function *temporarily*
    target.set path, fn

    



  ###
  ###

  _debounceUpdate: () =>
    clearTimeout @_debounceTimeout
    @_debounceTimeout = setTimeout @update, 0




class ClipScripts

  ###
  ###

  constructor: (@clip, scripts) ->
    @_scripts = {}
    @names = []
    @_bindScripts scripts

  ###
  ###

  watch: () ->
    for key of @_scripts
      @_scripts[key].watch()
    @

  ###
  ###

  update: () ->
    for key of @_scripts
      @_scripts[key].update()
    @


  ###
  ###

  dispose: () ->
    for key of @_scripts
      @_scripts[key].dispose()

    @_scripts = {}

  ###
  ###

  get: (name) -> @_scripts[name]

  ###
  ###

  _bindScripts: (scripts) ->
    if scripts.fn
      @_bindScript "value", scripts
    else
      for scriptName of scripts
        @_bindScript scriptName, scripts[scriptName]

  ###
  ###

  _bindScript: (name, script, watch) ->
    @names.push name
    clipScript = new ClipScript script, @clip
    @_scripts[name] = clipScript
    clipScript.on "change", (value) =>
      @clip.set name, value







class Clip
  
  ###
  ###

  constructor: (@options) ->
    @_self = new bindable.Object()
    @reset options.data, false
    @modifiers = options.modifiers or {}
    scripts = @options.scripts or @options.script

    if scripts
      @scripts = new ClipScripts @, scripts

    if options.watch isnt false
      @watch()

  reset: (data = {}, update = true) ->
    @data = if data.__isBindable then data else new bindable.Object data
    if update
      @update()
    @

  watch: () ->
    @scripts.watch()
    @

  update: () ->
    @scripts.update()
    @

  dispose: () -> 

    @_self?.dispose()
    @scripts?.dispose()

    @_self     = undefined
    @_scripts  = undefined


  script: (name) ->
    @scripts.get name

  get  : () -> @_self.get arguments...
  set  : () -> @_self.set arguments...
  bind : () -> @_self.bind arguments...


module.exports = Clip
