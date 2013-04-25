Base = require "./base"
utils = require "./utils"

class BlockBinding extends Base
  
  ###
  ###

  type: "block"

  ###
  ###

  constructor: (@script, @children) ->
    super()

  ###
  ###

  _writeHead: (info, callback) ->
    utils.startBindingBlock @, info
    callback()
    
  ###
  ###

  _writeTail: (info, callback) ->
    utils.endBindingBlock @, info
    callback()

  ###
  ###

  _writeChildren: (info, callback) ->
    # TODO - wrap each child item in a comment tag (bindable)
    callback()

  ###
  ###

  clone: () -> new BlockBinding @script, Base.cloneEach @children


  
module.exports = BlockBinding