CollectionExpression = require "../../base/collectionExpression"

class RefPathExpression extends CollectionExpression
  
  ###
  ###

  _type: "refPath"

  ###
  ###

  constructor: (items, @castAs, @assign = "") ->
    super items

  ###
  ###

  toPathString: () ->
    @items.join(".")

  ###
  ###

  toString: () ->
    buffer = ["this"]
    currentChain = []
    self = false

    if @castAs
      buffer.push(".castAs('#{@castAs}')")

    for part in @items
      if part._type is "fn"

        @_pushRef buffer, currentChain, self

        buffer.push ".call('", part.name, "', ["
        buffer.push part.params.toString(), "])"
        currentChain = []
        self = false
      else
        currentChain.push part.name
        self = self or part.self
    


    @_pushRef buffer, currentChain, self

    buffer.push ".value(#{@assign})"


    buffer.join ""

  ###
  ###

  _pushRef: (buffer, chain, self) ->
    if chain.length
      command = if self then "self" else "ref"
      buffer.push ".#{command}('", chain.join("."), "')"



module.exports = RefPathExpression