class Fragment extends require("./base")
  
  ###
  ###

  constructor: (children) ->
    super()
    @addChild children...

module.exports = (children) -> new Fragment children