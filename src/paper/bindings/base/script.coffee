class ScriptBinding extends require("./index")
  
  ###
  ###

  constructor: (@clip, @scriptName) ->
    @script = clip.script(@scriptName)

  ###
  ###

  bind: (@context) -> 

    if @watch isnt false
      @script.watch().update()
    
    self = @
    @_binding = @clip.bind(@scriptName, (value) ->
      self._onChange(value)
    ).now()

    @

  ###
  ###

  unbind: () ->
    @_binding?.dispose()
    @_binding = undefined
    @

  ###
  ###

  _onChange: (value) ->

module.exports = ScriptBinding