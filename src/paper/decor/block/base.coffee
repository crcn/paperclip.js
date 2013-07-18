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
    @clip.bind(@scriptName).to(@_onChange).now()

  ###
  ###

  dispose: () ->


  ###
  ###

  _onChange: (value) =>

  ###
  ###

  @test: (node) -> false


module.exports = NodeDecor