# default modifiers


module.exports = {

  uppercase: (value) -> 
    String(value).toUpperCase()

  lowercase: (value) -> 
    String(value).toLowerCase()

  # data-binding both ways
  bothWays: (value, y = true) ->
    @options.bothWays = {} if not @options.bothWays
    @options.bothWays[@currentRefs[0].path()] = if y then @currentRefs[0] else undefined
    value

  json: (value, count, delimiter) ->
    JSON.stringify.apply JSON, arguments

  replace: (ref, newValue) -> 
    for ref in @currentRefs
      ref.value newValue
    newValue

}
