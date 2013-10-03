# from node-ent

entities = 
  "<": "lt"
  "&": "amp"
  ">": "gt"
  "\"": "quote"

module.exports = (str) ->
  str = String(str)

  str.split('').map((c) -> 
    e = entities[c]
    cc = c.charCodeAt 0

    if e
      return "&#{e};"
    else if c.match /\s/
      return c
    else if cc < 32 or cc > 126
      return "&##{cc};"

    return c
  ).join('')
