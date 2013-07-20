bindable = require "bindable"

class Element

  ###
  ###

  nodeType: 3

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

  appendChild: (node) -> 

    # frag
    if node.nodeType is 11
      @appendChild(child) for child in node.childNodes  
      return

    node.parentNode = @
    @childNodes.push node


  ###
  ###


  ###
  ###

  removeChild: (child) ->
    i = @childNodes.indexOf child
    return unless ~i
    @childNodes.splice i, 1

  ###
  ###

  insertBefore: (newElement, before) ->
    @_splice @childNodes.indexOf(before), 0, newElement


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

  ###
  ###

  _splice: (index = -1, count, node) ->

    return unless ~index

    if node
      node.parentNode = @

    @childNodes.splice arguments...




class Text

  ###
  ###

  nodeType: 3

  ###
  ###

  constructor: (@value) ->

  ###
  ###

  toString: () -> @value


class Comment extends Text
  
  ###
  ###

  nodeType: 8

  ###
  ###


  toString: () -> "<!--#{super()}-->"



class Fragment
  
  ###
  ###

  nodeType: 11

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



class StringNodeFactory

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

  createComment: (text) -> new Comment text

  ###
  ###

  createFragment: () -> 
    frag = new Fragment()
    for child in arguments
      frag.appendChild child
    frag


module.exports = (context) -> new StringNodeFactory context