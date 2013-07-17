bindable = require "bindable"

class Element

  ###
  ###

  constructor: (@name) ->
    @attributes = {}
    @childNodes = []

  ###
  ###

  setAttribute: (name, value) -> @attributes[name] = value

  ###
  ###

  appendChild: (node) -> @childNodes.push node

  ###
  ###

  toString: () ->
    buffer = ["<", @name]

    for name of @attributes
      buffer.push name + "=" + attributes[name]

    buffer.push ">"
    buffer.push @childNodes...
    buffer.push "<", @name, "/>"

    buffer.join ""



class Text

  ###
  ###

  constructor: (@value) ->

  ###
  ###

  toString: () -> @value


class Section

  ###
  ###

  constructor: () ->
    @_children = []

  ###
  ###

  appendChild: (child) -> @_children.push child


  ###
  ###

  toString: () -> @_children.join ""



class StringWriter

  ###
  ###

  constructor: (@context) -> 
    @internal = new bindable.Object()

  ###
  ###

  createElement: (name) -> new Element name

  ###
  ###

  createTextNode: (text) -> new Text text

  ###
  ###

  createSection: () -> new Section()


module.exports = (context) -> new StringWriter context