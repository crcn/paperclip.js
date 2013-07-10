class RootExpression extends require("./base")
  
  _method: "html"

  constructor: (@children) ->  
    super()
    @addChild children

  
  toString: () ->
    "module.exports = function(paper){ return paper.create().text('#{@children}') }"

module.exports = RootExpression