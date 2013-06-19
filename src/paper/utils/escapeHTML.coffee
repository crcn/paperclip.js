# from node-ent

entities = 
  "<": "lt"
  "&": "amp"
  ">": "gt"

module.exports = (str) ->
  str = String(str)

  str.split('').map((c) -> 
    e = entities[c]
    cc = c.charCodeAt 0

    if e
      return "&#{e};"
    else if c.match /\s/
      return c
    else if c < 32 or c > 126
      return "&##{cc};"

    return c
  ).join('')
