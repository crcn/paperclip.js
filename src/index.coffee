
Parser = require "./parser"
p = new Parser()
p.parse("text: name")
p.parse("text: messages.length() > 0 ? hello : crap")
p.parse("css: {'test-name':hello}; text: world")
p.parse("each: children | filter({ age: { $gt: 5 } })")
p.parse("text: name | filter(name.length() > 5, test | filter(abcde)) | cat(name); css: craig")
