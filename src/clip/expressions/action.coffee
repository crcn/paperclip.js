base = require "../../base/expression"

class ActionExpression extends base.Expression
  
  ###
  ###

  _type: "action"

  ###
  ###

  constructor: (@name, @options) ->
    super()

  ###
  ###

  toString: () -> 
    buffer = ["{"]

    buffer.push "name:'#{@name}', "
    buffer.push "value:" + @options.toString()

    buffer.push "}"
    buffer.join ""


module.exports = ActionExpression