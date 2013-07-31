CollectionExpression = require "../../base/collectionExpression"

class ActionsExpression extends CollectionExpression
    
  ###
  ###

  _type: "scripts"

  ###
  ###

  constructor: (items) ->
    super items
    @actions = items

  ###
  ###
  
  toString: () ->
    buffer = ["{"]
    params = []

    for action in @actions
      params.push "'#{action.name}': #{action.toString()}"

    buffer.push params.join(","), "}"


    buffer.join ""



module.exports = ActionsExpression