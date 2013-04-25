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

###
node.load({ data: new bindable.Object({ first: { name: "craig" } }), buffer: [] }, (err, content) {

  # add the html
  el.html(content);

  # finds all comments
  binder.bind(node, el)
})
###


node.load { data: new bindable.Object({ first: { name: "craig" } }), buffer: [], nodes: {} }, (err, content) ->
  console.log JSON.stringify content.buffer, null, 2


