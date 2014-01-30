CollectionExpression = require "../../base/collectionExpression"

class RefPathExpression extends CollectionExpression
  
  ###
  ###

  _type: "refPath"

  ###
  ###

  constructor: (items, @castAs, @assign, @unbound) ->
    super items

    if @assign
      @_children.push @assign

  ###
  ###

  toPathString: () ->
    @items.join(".")


  ###
  ###

  toArrayString: () ->
    "[" + @items.map((item) ->
      "'" + item + "'"
    ).join(",") + "]"

  ###
  ###

  toString: () ->
    buffer = ["this."]
    currentChain = []
    self = false


    callChain = []

    #if @castAs
    #  buffer.push(".castAs('#{@castAs}')")

    call = false

    for part in @items
      if part._type is "fn"
        call = true

        if currentChain.length
          callChain.push '['+currentChain.join(",")+']'

        callChain.push '"'+part.name+'"'

        callChain.push "[" + part.params.toString() + "]"

        currentChain = []
        self = false
      else
        currentChain.push "'" + part.name + "'"
        self = self or part.self
    
    if currentChain.length
      if currentChain.length is 1
        callChain.push currentChain[0]
      else
        callChain.push '['+currentChain.join(",")+']'

    if call
      buffer.push "call"
    else if @assign
      buffer.push "set"
      callChain.push @assign
    else
      buffer.push "get"

    buffer.push "("+callChain.join(",")+")"


    buffer.join ""



module.exports = RefPathExpression