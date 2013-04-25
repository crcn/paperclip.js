Base           = require "./base"
bindable       = require "bindable"
Html           = require "./html"

class Builder

  ###
  ###

  constructor: (@factory) ->

  ###
  ###

  build: () -> @factory.call @

  ###
  ###

  create: () -> new Html()




module.exports = Builder

b = new Builder require("../../../test")
node = b.build()

# 1. Load the template initially
# 2. map (scan DOM)
# 3. find bindings

node.write { data: new bindable.Object({ first: { name: "craig" } }), buffer: [] }, (err, content) ->
  console.log JSON.stringify content, null, 2


