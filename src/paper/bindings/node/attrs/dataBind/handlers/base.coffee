class BaseDataBindHandler extends require("../../../../base/script")
  
  ###
  ###

  constructor: (@node, @clip, @name) ->
    super @clip, @name

module.exports = BaseDataBindHandler