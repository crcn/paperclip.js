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
    buffer = ["this."]
    currentChain = []
    self = false


    callChain = []

    #if @castAs
    #  buffer.push(".castAs('#{@castAs}')")

    for part in @items
      if part._type is "fn"

        if currentChain.length
          callChain.push '"'+currentChain.join(".")+'"'

        callChain.push "['" + part.name + "'" + (if part.params.items.length then "," + part.params.toString() else "") + "]"

        currentChain = []
        self = false
      else
        currentChain.push part.name
        self = self or part.self
    
    if currentChain.length
      callChain.push '"'+currentChain.join(".")+'"'


    if @assign isnt ""
      buffer.push "_s"
      callChain.push @assign
    else
      buffer.push "_g"

    buffer.push "("+callChain.join(",")+")"


    buffer.join ""



module.exports = RefPathExpression