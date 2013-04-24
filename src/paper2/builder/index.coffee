Node    = require "./node"
Text    = require "./text"
Binding = require "./binding"

class Builder

  ###
  ###

  constructor: (@factory) ->

  ###
  ###

  build: () -> @factory.call @

  ###
  ###

  node: (name, options) -> new Node name, options

  ###
  ###

  binding: (name, children) -> new Binding name, options

  ###
  ###

  text: (buffer) -> new Text buffer

module.exports = Builder

b = new Builder require("../../../test")
node = b.build()
