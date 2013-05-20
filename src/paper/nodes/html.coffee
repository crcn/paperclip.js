NodeBinding    = require "./nodeBinding"
BlockBinding   = require "./blockBinding"
StringBuffer   = require "./string"
Base           = require "./base"


class Html extends Base

  ###
  ###

  name: "html"
  
  ### 
   just an html buffer
  ###

  html: (content) -> 
    @addChild new StringBuffer content
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

  blockBinding: (script, child) -> 
    @addChild new BlockBinding script, child
    @

  ###
    single-line text binding 
  ###

  textBinding: (binding) -> return @blockBinding binding

  ###
  ###

  clone: () -> 
    html = new Html()
    html.children = Base.cloneEach @children
    html

module.exports = Html
  