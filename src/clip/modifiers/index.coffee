# default modifiers


module.exports = {

  uppercase: (value) -> 
    String(value).toUpperCase()

  lowercase: (value) -> 
    String(value).toLowerCase()

  json: (value, count, delimiter) ->
    JSON.stringify.apply JSON, arguments

  replace: (value, newValue) -> 
    newValue
}
