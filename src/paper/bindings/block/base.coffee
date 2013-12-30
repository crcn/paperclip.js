class BlockBinding extends require("../base/script")

  ###
  ###

  constructor: (options) ->

    @section            = options.section
    @clip               = options.clip
    @application        = options.application
    @nodeFactory        = @application.nodeFactory
    @contentTemplate    = options.template
    @scriptName         = options.scriptName
    @childBlockTemplate = options.childBlockTemplate

    @script = @clip.script @scriptName

    super @clip, @scriptName

  ###
  ###

  bind: (@context) ->
    # don't update the scripts - causes them to be called twice
    @clip.reset(@context, false)
    super @context


  unbind: () ->
    super()
    @clip.unwatch()

  ###
  ###

  @test: (node) -> false


module.exports = BlockBinding