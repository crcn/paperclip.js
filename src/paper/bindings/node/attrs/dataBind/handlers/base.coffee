class BaseDataBindHandler extends require("../../../../base/script")
  
  ###
  ###

  constructor: (application, @node, clip, @name) ->
    super application, clip, name

module.exports = BaseDataBindHandler