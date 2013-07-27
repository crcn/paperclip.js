class BlockBinding extends require("../base")

  ###
  ###

  constructor: (@section, @clip, @nodeFactory, @scriptName) ->
    @script = @clip.script @scriptName
    @clip   = @clip

  ###
  ###

  load: (context) ->

  ###
  ###

  bind: () -> 
    @_binding = @clip.bind(@scriptName).to(@_onChange).now()

  ###
  ###

  unbind: () ->
    @_binding?.dispose()
    @_binding = undefined

  ###
  ###

  _onChange: (value) =>

  ###
  ###

  @test: (node) -> false


module.exports = BlockBinding