class NodeDecor

  ###
  ###

  constructor: (@block, @scriptName) ->
    @script = block.clip.script(@scriptName)
    @clip   = block.clip


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


module.exports = NodeDecor