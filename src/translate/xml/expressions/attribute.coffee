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

  toString: () -> "attr('#{@name}', #{@value})"

module.exports = AttributeExpression