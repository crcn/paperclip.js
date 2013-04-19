CollectionExpression = require("./collection")

class Evaluator extends CollectionExpression.Evaluator

  init: () ->
    super()
    @_watch()
  
  # wraps something like 
  # items.size() in
  # this.ref("items.size").call()
  toString: () ->

    buffer = ["this"]
    currentChain = []

    for part in @items
      if part.expr._type is "fn"

        if currentChain.length
          buffer.push ".ref('", currentChain.join("."), "')"

        buffer.push ".call('", part.name, "', ["
        buffer.push part.params.toString(), "])"
        currentChain = []
      else
        currentChain.push part.name

    if currentChain.length
      buffer.push ".ref('", currentChain.join("."), "')"

    buffer.push(".value()")

    buffer.join("")


  _watch: () ->
    watchable = []
    cw = []

    # TODO - this needs to act a bit like deep property watcher
    for part in @items

      cw.push part.name

      if part.expr._type is "fn"
        if cw.length
          watchable.push cw
        cw = []


    if cw.length
      watchable.push cw


    for propertyChain in watchable
      @context.bind propertyChain.join("."), @_change






class RefPathExpression extends CollectionExpression

  _type: "refPath"

  evaluate: (context) -> new Evaluator @, context


module.exports = RefPathExpression