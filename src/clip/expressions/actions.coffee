CollectionExpression = require "../../base/collectionExpression"

class ActionsExpression extends CollectionExpression
    
  _type: "actions"

  constructor: (items) ->
    super items
    @actions = items

  toString: () ->
    buffer  = ["["]
    actions = []

    for action in @actions
      actions.push action.toString()

    buffer.push actions.join ","

    buffer.push "]"

    buffer.join ""



module.exports = ActionsExpression