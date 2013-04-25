NodeBinding    = require "./nodeBinding"
TextBinding    = require "./textBinding"
BlockBinding   = require "./blockBinding"
StringBuffer   = require "./string"
Base           = require "./base"


class Html extends Base
  
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

  blockBinding: (name, children) -> 
    @addChild new BlockBinding name, children
    @

  ###
    single-line text binding 
  ###

  textBinding: (binding) -> 
    @addChild new TextBinding binding
    @

  ###
  ###

  clone: () -> 
    html = new Html()
    html._children = Base.cloneEach @_children
    html

module.exports = Html
  