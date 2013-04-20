# default modifiers


module.exports = {

  uppercase: (value) -> 
    String(value).toUpperCase()

  lowercase: (value) -> 
    String(value).toLowerCase()

  # data-binding both ways
  bothWays: (value, y = true) ->
    this.options.bothWays = y
}
