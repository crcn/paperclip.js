NodeBinding    = require "./nodes/nodeBinding"
BlockBinding   = require "./nodes/blockBinding"
StringBuffer   = require "./nodes/string"
Fragment       = require "./nodes/fragment"

modifiers = require "./defaultModifiers"

class Loader
  
  ###
  ###

  @fragment: (childNodes) =>
    new Fragment childNodes

  ###
  ###

  @element: (name, attrs, childNodes) =>

    options = 
      attributes: attrs
      children: childNodes or []

    new NodeBinding name, options

  ###
  ###

  @block: (options, contentTemplate = (() ->), childTemplate = (() ->)) =>
    new BlockBinding(options, @load(contentTemplate), @load(childTemplate))

  ###
  ###

  @text: (buffer) =>
    new StringBuffer buffer

  ###
  ###

  @load: (template) =>
    template @fragment, @block, @element, @text, modifiers


module.exports = Loader.load

