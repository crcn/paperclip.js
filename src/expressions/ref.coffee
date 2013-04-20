base = require "./base"

class RefExpression
  _type: "ref"
  constructor: (@name) ->
  toString: () -> @name
  references: () -> []
  

module.exports = RefExpression