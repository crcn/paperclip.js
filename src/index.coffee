
Parser = require "./parser"
p = new Parser()
p.parse("text: name")
p.parse("text: messages.length() > 0 ? 'hello' : 'crap'; ")
