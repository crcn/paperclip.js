base = require "./base"

class ScriptExpression extends base.Expression

  _type: "script"

  constructor: (@expressions) ->
    super()
    @addChild @expressions

  toString: () ->
    @expressions.toString()





module.exports = ScriptExpression