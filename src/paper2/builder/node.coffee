async = require "async"

class Node

  ###
  ###

  constructor: (@name, options = {}) ->
    @children   = options.children or []
    @attributes = options.attrs or {}


  ###
  ###

  write: (writer, next) ->


module.exports = Node