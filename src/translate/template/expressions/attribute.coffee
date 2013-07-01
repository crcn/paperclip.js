class AttributeExpression extends require("./base")
  
  _type: "attribute"

  ###
  ###

  constructor: (@name, @value) ->
    super()

    if @value
      @addChild @value



  ###
  ###

  hasBinding: () ->
    return false if not @value
    for part in @value.items
      return true if part._binding

    return false


  ###
  ###

  toJsString: () -> @value

module.exports = AttributeExpression