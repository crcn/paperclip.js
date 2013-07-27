module.exports = 
  
  # hello -> HELLO
  uppercase: (value) -> String(value).toUpperCase()

  # HELLO -> hello
  lowercase: (value) -> String(value).toLowerCase()

  # hello -> Hello
  titlecase: (value)  -> 
    str = String(value)
    str.substr(0, 1).toUpperCase() + str.substr(1)

  # json stringify - examine a json object
  json: (value, count, delimiter) ->
    JSON.stringify.apply JSON, arguments