
Parser = require "./parser"
Clip   = require "./clip"

p = new Parser()
#p.parse("text:$name| filter({name:age>5 && person.age(item.name) >6}) | json(five)")
#p.parse("text: messages.length() > 0 ? hello : crap")
#p.parse("css: {'test-name':hello}; text: world")
#p.parse("each: children | filter({ age: { $gt:  } })")
#p.parse("each: children | filter(filt) | json()")

#expressions = []
#for i in [0..1000]
#  expressions.push p.parse("text: name | filter(name.length() > 5, test | filter(abcde)) | cat(name); css: craig")


expr = p.parse("text: person.age > 5")

clip = new Clip()

clip.data.set "name", "craig"

evaluator = expr.evaluate(clip)

clip.data.set "person.age", 5
clip.data.set "person.age", 6

evaluator.actions[0].bind () ->


#expr.eval(new BindableObject()).on("")

setTimeout (() ->

), 1000 * 60