class Fragment extends require("./base")

  constructor: (children = []) ->
    super()
    for child in children
      @addChild child


module.exports = Fragment