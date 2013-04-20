base = require "./base"

class FnExpression extends base.Expression
  _type: "fn"
  constructor: (@name, @params) ->
    super()
    @addChild @params

module.exports = FnExpression