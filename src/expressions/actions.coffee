CollectionExpression = require "./collection"

class Evaluator extends CollectionExpression.Evaluator

  constructor: () ->
    super arguments...
    @actions = @items

class ActionsExpression extends CollectionExpression
    
  _type: "actions"

  ###
  ###

  evaluate: (context) -> new Evaluator @, context


module.exports = ActionsExpression