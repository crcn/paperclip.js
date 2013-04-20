base = require "./base"


class ActionExpression extends base.Expression
  
  _type: "action"

  constructor: (@name, @options) ->
    super()

  references: () -> @options.references()
    
  toString: () -> 
    buffer = ["{"]

    buffer.push "name:'#{@name}', "
    buffer.push "value:" + @options.toString()

    buffer.push "}"
    buffer.join ""


module.exports = ActionExpression