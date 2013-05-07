Base  = require "./base"
decorFactory = require("../decor/blockFactory")
Clip = require "../../clip"

class BlockBinding extends require("./bindable")
  
  ###
  ###

  name: "blockBinding"

  ###
  ###

  constructor: (@script, @content) ->
    super()
    if @content
      @addChild content
    @clip = new Clip { script: script, watch: false }
    @_decor = decorFactory.getDecor @


  ###
  ###

  bind: (@section) -> 
    super section
    @clip.watch()
    @_decor.bind()


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