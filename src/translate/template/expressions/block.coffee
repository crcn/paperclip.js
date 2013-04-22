base          = require "../../base/expression"
Clip          = require "../../../clip"
bindingParser = require "../../binding/parser"

class Expression extends base.Expression
  _type       : "block"
  constructor : (@value) ->
  toString    : () -> 
    "pushScript(#{bindingParser.parse(@value.toString())})"

module.exports = Expression
