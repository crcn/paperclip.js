class BlockBinding extends require("../base/script")

  ###
  ###

  constructor: (options) ->

    @section            = options.section
    @clip               = options.clip
    @application        = options.application
    @nodeFactory        = @application.nodeFactory
    @$                  = @application.$
    @contentTemplate    = options.template
    @scriptName         = options.scriptName
    @childBlockTemplate = options.childBlockTemplate

    @script = @clip.script @scriptName

    super @clip, @scriptName

  ###
  ###

  bind: (@context) ->
    @clip.reset @context
    super @context


  unbind: () ->
    super()
    @clip.reset().unwatch().watch()

  ###
  ###

  @test: (node) -> false


module.exports = BlockBinding