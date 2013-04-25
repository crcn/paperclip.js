base = require "./base"

class BlockBinding extends require("./bindable")
  
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
    @_bindingStart info
    callback()

  ###
  ###

  _writeChildren: (info, callback) ->
    # TODO - wrap each child item in a comment tag (bindable)
    callback()

  ###
  ###

  _writeTail: (info, callback) ->
    @_bindingEnd info
    callback()

  ###
  ###

  clone: () -> new BlockBinding @script, base.cloneEach @children


  
module.exports = BlockBinding