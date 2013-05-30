class NodeDecor

  ###
  ###

  constructor: (@node, @scriptName) ->
    @script = node.clip.script(@scriptName)
    @clip   = node.clip


  ###
  ###

  load: (context) ->

  ###
  ###

  bind: () -> 
    @clip.bind(@scriptName).to @_onChange

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