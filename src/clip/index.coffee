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

      if cv.__isBindable
        @watcher._watch command.ref, cv

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

    return cv


###
###

class ClipScript extends events.EventEmitter

  ###
  ###

  constructor: (@script, @clip) ->

    @options    = @clip.options
    @_watching  = {}
    @cast       = {}

  ###
  ###

  dispose: () ->

    for key of @_watching
      @_watching[key].dispose()

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
    @

  ###
  ###

  unwatch: () ->
    @__watch = false
    for key of @_watching
      @_watching[key].dispose()
    @_watching = {}
    @

  ###
  ###

  references: () ->  @script.refs or []

  ###
  ###

  ref    : (path) -> new PropertyChain(@).ref path
  self   : (path) -> new PropertyChain(@).self path
  call   : (path, args) -> new PropertyChain(@).call path, args
  castAs : (name) -> new PropertyChain(@).castAs name

  ###
   watches 
  ###

  _watch: (path, target) ->

    return if not @__watch

    if @_watching[path]
      return if @_watching[path].target is target
      @_watching[path].dispose()

    lockUpdate = true

    @_watching[path] = 
      target  : target
      binding : binding = target.bind(path).to((value, oldValue) =>

        if value?.__isBindable
          @_watchBindable(value, oldValue) 
        else if type(value) is "function"
          @_spyFunction(path, value, target)

        return if lockUpdate
        @update()
      ).now()
      dispose : () ->
        binding.dispose()

    lockUpdate = false
    

  ###
   watches a bindable object for any changes, then updates this binding asynchronously This is important
   for such a case: {{ someObject | someComputer() }}
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

    # if the function is a spying function, then ignore it
    return if fn.__isCallSpy


    self = @

    # need to fetch the owner of the function so proper items are 
    # references
    target = target.owner?(path) or target


    # references attached to the function? watch them!
    if fn.refs
      for ref in fn.refs
        @_watch ref, target
      return
    else
      return

    # DEPRECATED
    ###
    fn = () ->
      refs   = []
      oldGet = @get

      # override this.get temporarily
      @get = (key) ->
        refs.push(key) if key and key.length
        oldGet.call @, key

      # call the old function
      ret = oldFn.apply @, arguments

      # reset the old this.get function
      @get = oldGet

      oldFn.refs = refs

      #reset the old function
      @set path, oldFn

      ret

    # set callspy to the overridden function, since _spyFunction
    # will be called again after it's overridden. We want to prevent an infinite loop!
    fn.__isCallSpy = true

    # override the old function *temporarily*
    target.set path, fn
    ###

    
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

  unwatch: () ->
    for key of @_scripts
      @_scripts[key].unwatch()
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
    return

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
    @_self = @context = options.context or new bindable.Object()
    @reset options.data, false
    scripts = @options.scripts or @options.script

    if scripts
      @scripts = new ClipScripts @, scripts

    if options.watch isnt false
      @watch()

  ###
  ###

  reset: (data = {}, update = true) ->
    @data = if data.__isBindable then data else new bindable.Object data
    if update
      @update()
    @

  ###
  ###

  watch: () ->
    @scripts.watch()
    @

  ###
  ###

  unwatch: () ->
    @scripts.unwatch()

  ###
  ###

  update: () ->
    @scripts.update()
    @

  ###
  ###

  dispose: () -> 

    @_self?.dispose()
    @scripts?.dispose()



  script: (name) ->
    @scripts.get name


  get  : () -> @_self.get arguments...
  set  : () -> @_self.set arguments...
  bind : () -> @_self.bind arguments...


module.exports = Clip
