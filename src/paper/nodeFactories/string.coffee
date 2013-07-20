bindable = require "bindable"

class Node
  __isNode: true

class Container extends Node

  
  ###
  ###

  constructor: () ->
    @childNodes = []

  ###
  ###

  appendChild: (node) -> 


    # frag
    if node.nodeType is 11
      @appendChild(child) for child in node.childNodes  
      return

    @_link node
    @childNodes.push node

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

  _splice: (index = -1, count, node) ->

    return unless ~index

    if node
      @_link node

    @childNodes.splice arguments...

  ###
  ###

  _link: (node) ->  

    unless node.__isNode
      throw new Error "cannot append non-node"

    node.parentNode = @





class Element extends Container

  ###
  ###

  nodeType: 3

  ###
  ###

  constructor: (@name) ->
    super()
    @attributes = {}

  ###
  ###

  setAttribute: (name, value) -> @attributes[name] = value


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




class Text extends Node

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



class Fragment extends Container
  
  ###
  ###

  nodeType: 11

  ###
  ###

  toString: () -> @childNodes.join ""



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

  ###
  ###

  parseHtml: (buffer) -> 

    # this should really parse HTML, but too much overhead
    @createTextNode buffer


module.exports = (context) -> new StringNodeFactory context