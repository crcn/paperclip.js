class BlockBinding extends require("../base/script")

  ###
  ###

  constructor: (options) ->

    @section            = options.section
    @clip               = options.clip
    @nodeFactory        = options.nodeFactory
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

  ###
  ###

  @test: (node) -> false


module.exports = BlockBinding