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
  
    @_binding = @clip.bind(@scriptName)

    if @_map
      @_binding.map @_map

    @_binding.to @_onChange

    @_binding.now()
    @

  ###
  ###

  unbind: () ->
    @_binding?.dispose()
    @_binding = undefined
    @

  ###
  ###

  _onChange: (value) =>

module.exports = ScriptBinding