dref             = require "dref"
events           = require "events"
bindable         = require "bindable"
type             = require "type-component"

###
###

class ClipScript extends events.EventEmitter

  ###
  ###

  constructor: (@script, @clip) ->
    @options    = @clip.options
    @_bindings  = []

  ###
  ###

  dispose: () ->
    binding.dispose() for binding in @_bindings

  ### 
   TODO - some 
  ###

  update: () ->
    return if @_locked
    @_watchRefs()

    @_locked = true
    newValue = @script.fn.call @
    @_locked = false

    return newValue if newValue is @value
    @_updated = true

    # TODO - optmization - set 
    @emit "change", @value = newValue

    newValue

  ###
  ###

  get: (path) -> @__context.get(path)

  ###
  ###

  set: (path, value) -> @__context.set(path, value)

  ###
  ###

  call: (ctxPath, key, params) -> 

    if arguments.length is 2
      params = key
      ctx    = @__context
      fn     = ctx.get(ctxPath)
    else
      ctx  = @__context
      fn  = ctx.get(ctxPath + "." + key)

    fn?.apply(ctx, params)

  ###
  ###

  watch: () ->
    @__watch = true
    @

  ###
  ###

  unwatch: () ->
    @__watch = false
    @dispose()
    @

  ###
  ###

  references: () ->  @script.refs or []

  ###
  ###

  _watchRefs: () ->
    return if @__context is @clip.data
    @__context = @clip.data
    return unless @script.refs
    for ref in @script.refs then do (ref) =>
      bindableBinding = undefined

      # this is a bug with bindable.js. We don't want to call
      # .now() since it adds more overhead - we just want to listen for any changes
      # on the given value. This causes some wierd edge cases though where a value might have
      # been assigned, then emitted as undefined. "locked" is a quick fix
      locked = true
      @_bindings.push binding = @__context.bind ref, (value, oldValue) =>

        if bindableBinding
          bindableBinding.dispose()
          @_bindings.splice(@_bindings.indexOf(bindableBinding), 1)

        if value?.__isBindable
          @_bindings.push bindableBinding = @_watchBindable(value, oldValue) 

        return if locked

        @update()

      binding.now()
      locked = false


    

  ###
   watches a bindable object for any changes, then updates this binding asynchronously This is important
   for such a case: {{ someObject | someComputer() }}
  ###

  _watchBindable: (value, oldValue) ->

    value.on "change", onChange = () =>
      return if not @_updated
      @_debounceUpdate()

    dispose: () =>
      value.off "change", onChange

  ###
  ###

  _update2: () => @update()
    
  ###
  ###

  _debounceUpdate: () =>
    clearTimeout @_debounceTimeout
    @_debounceTimeout = setTimeout @_update2, 0




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

  reset: (data, update = true) ->
    @data = if data then data else new bindable.Object()
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
