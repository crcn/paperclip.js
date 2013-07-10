Element        = require "./element"
Block          = require "./block"
Text           = require "./string"
Base           = require "./base"


class Html extends Base

  ###
  ###

  name: "html"
  
  ### 
   just an html buffer
  ###

  text: (content) -> 
    @addChild new Text content
    @

  ###
   Node which has a binding
  ###

  element: (name, options) -> 
    @addChild new Element name, options
    @

  ###
   binding with children
  ###

  block: (script, contentFactory, childBinding) -> 
    @addChild new Block script, contentFactory, childBinding
    @

  ###
  ###

  clone: () -> 
    html = new Html()
    html.children = Base.cloneEach @children
    html

module.exports = Html
  