ParamsExpression = require "./params"

class GroupExpresion extends ParamsExpression
  
  ###
  ###

  _type: "group"

  ###
  ###
  
  toString: () -> "(#{super()})"

module.exports = GroupExpresion