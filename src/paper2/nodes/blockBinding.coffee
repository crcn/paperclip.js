Base  = require "./base"
decorFactory = require("../decor/blockFactory")
Clip = require "../../clip"

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