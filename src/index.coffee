
Parser = require "./parser"
p = new Parser()
p.parse("text: name")
p.parse("text: messages.length(()).fact > 0")
