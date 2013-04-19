
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


expr = p.parse("text: person.name | append(person.count | negate()) | capitalize()")

clip = new Clip({}, {
  modifiers: {
    localize: (value) -> "ching chong!",
    append: (value, text) -> value + text
    capitalize: (value, count) -> String(value).toUpperCase()
    negate: (value) -> -value
  }
})


evaluator = expr.evaluate(clip)


evaluator.actions[0].bind (value) ->
  console.log value

clip.data.set "person.name", "jake"

for i in [0..10]
  clip.data.set "person.count", i


clip.data.set "person.name", "jeff"


clip.data.set "person.count", 0



