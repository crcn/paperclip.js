CollectionExpression = require("./collection")


class RefPathExpression extends CollectionExpression
  _type: "refPath"

  references: () ->
    refs = super()
    refs.push @
    refs

  toString: () ->
    buffer = ["this"]
    currentChain = []

    for part in @items
      if part._type is "fn"

        if currentChain.length
          buffer.push ".ref('", currentChain.join("."), "')"

        buffer.push ".call('", part.name, "', ["
        buffer.push part.params.toString(), "])"
        currentChain = []
      else
        currentChain.push part.name

    if currentChain.length
      buffer.push ".ref('", currentChain.join("."), "')"

    buffer.push ".value()"

    buffer.join ""


module.exports = RefPathExpression