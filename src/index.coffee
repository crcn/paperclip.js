
compile = require("./compile")
Clip     = require("./clip")

scripts = compile("text: person.name ? 'hey ' + person.name : 'no person available' | uppercase() | swearize(); name: person.name ")

clip = new Clip({
  data: { person: { name: "craig" }},
  script: scripts.text,
  modifiers: {
    uppercase: (value) ->  value.toUpperCase()
    swearize: (value) -> "SHIT... #{value}"
  }
})

clip.data.set "person.name", "craig"

clip.on "change", (value) ->
  console.log value

console.log clip.value
clip.data.set "person.name", undefined
clip.data.set "person.name", "josh"




