class BlockBinding extends require("../base")

  ###
  ###

  constructor: (options) ->

    @section         = options.section
    @clip            = options.clip
    @nodeFactory     = options.nodeFactory
    @contentTemplate = options.template
    @scriptName      = options.scriptName
    @childBlock      = options.childBlock

    @script = @clip.script @scriptName
    
  ###
  ###

  bind: (@context) -> 
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

  ###
  ###

  @test: (node) -> false


module.exports = BlockBinding