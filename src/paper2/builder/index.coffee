Base           = require "./base"
async          = require "async"
String         = require "./string"
bindable       = require "bindable"
NodeBinding    = require "./nodeBinding"
TextBinding    = require "./textBinding"
BlockBinding   = require "./blockBinding"

class Builder extends require("./base")

  ###
  ###

  constructor: (@factory) ->
    super()

  ###
  ###

  build: () -> 
    @factory.call @
    @



  ### 
   just an html buffer
  ###

  html: (content) -> 
    @addChild new String content
    @

  ###
   Node which has a binding
  ###

  nodeBinding: (name, options) -> 
    @addChild new NodeBinding name, options
    @

  ###
   binding with children
  ###

  blockBinding: (name, children) -> 
    @addChild new BlockBinding name, children
    @

  ###
    single-line text binding 
  ###

  textBinding: (binding) -> 
    @addChild new TextBinding binding
    @



module.exports = Builder

b = new Builder require("../../../test")
node = b.build()
node.write { data: new bindable.Object({name:"craig"}), buffer: [] }, (err, content) ->
  console.log JSON.stringify content, null, 2
