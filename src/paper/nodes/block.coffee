Base  = require "./base"
decorFactory = require("../decor/blockFactory")
Clip = require "../../clip"

# loops through a collection of models
# {{#each:people}}
# {{/}}


class BlockChild extends require("./bindable")
  
  ###
  ###

  constructor: (@block, @with) ->
    super()
    @content = @block.contentFactory()

  ###
  ###

  bind: () ->
    super()
    @content.bind()
    @

  ###
  ###

  dispose: () ->
    super()
    @content.dispose()
    @


  ###
  ###

  load: (context) ->
    return super context if not @with
    super context.child(@with)

  ###
  ###

  _loadChildren: (context) ->
    @content.load context

class BlockBinding extends require("./bindable")
  
  ###
  ###

  name: "block"

  ###
  ###

  constructor: (@script, @contentFactory, @childBinding) ->
    super()
    @clip = new Clip { script: script, watch: false }
    @_decor = decorFactory.getDecor @

  ###
  ###

  bind: () -> 
    super()
    @clip.watch()
    @_decor.bind()

  ###
  ###

  dispose: () ->
    @clip.dispose()
    @_decor.dispose()
    super()


  ###
  ###

  createContent: (wth) -> new BlockChild @, wth

  ###
  ###

  _writeHead: (context) ->
    @clip.reset context
    @clip.update()
    super context

  ###
  ###

  _loadChildren: (context) ->
    @_decor.load context

  ###
  ###

  clone: () -> new BlockBinding @script, Base.cloneEach @children

  
module.exports = BlockBinding