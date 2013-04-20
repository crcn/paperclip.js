base = require "./base"


class OptionsExpression extends base.Expression
  _type: "options"
  constructor: (@items) ->
    super()
    @addChild items




module.exports = OptionsExpression
