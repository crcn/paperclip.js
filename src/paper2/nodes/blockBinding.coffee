Base  = require "./base"
decorFactory = require("../decor/blockFactory")
Clip = require "../../clip"

# loops through a collection of items
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

  load: (context, callback) ->
    return super context, callback if not @with
    super context.child(@with), callback

  ###
  ###

  _loadChildren: (context, callback) ->
    @content.load context, callback

class BlockBinding extends require("./bindable")
  
  ###
  ###

  name: "blockBinding"

  ###
  ###

  constructor: (@script, @contentFactory) ->
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

  createContent: (wth) -> new BlockChild @, wth

  ###
  ###

  _writeHead: (context, callback) ->
    @clip.reset context
    @clip.update()
    super context, callback

  ###
  ###

  _loadChildren: (context, callback) ->
    @_decor.load context, callback

  ###
  ###

  clone: () -> new BlockBinding @script, Base.cloneEach @children

  
module.exports = BlockBinding