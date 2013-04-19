
Parser = require "./parser"
p = new Parser()
#p.parse("text:$name| filter({name:age>5 && person.age(item.name) >6}) | json(five)")
#p.parse("text: messages.length() > 0 ? hello : crap")
#p.parse("css: {'test-name':hello}; text: world")
#p.parse("each: children | filter({ age: { $gt:  } })")
#p.parse("each: children | filter(filt) | json()")

#expressions = []
#for i in [0..1000]
#  expressions.push p.parse("text: name | filter(name.length() > 5, test | filter(abcde)) | cat(name); css: craig")


expr = p.parse("text: name.last(first > 5, 4, name()).first.name.is() > 5 | filter(name.length > (true), test | filter(abcde)) | cat(name)")

evaluator = expr.evaluate({})


console.log evaluator.actions[0].toString()

#expr.eval(new BindableObject()).on("")

setTimeout (() ->

), 1000 * 60