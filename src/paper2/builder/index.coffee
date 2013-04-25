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

  create: () -> 
    new Html()




module.exports = Builder

b = new Builder require("../../../test")
node = b.build()

# 1. Load the template initially - this should also include all the modules
# 2. scan the dom, and map each bound element (next sibling until end) to their rep


node.write { data: new bindable.Object({ first: { name: "craig" } }), buffer: [] }, (err, content) ->
  console.log JSON.stringify content, null, 2


