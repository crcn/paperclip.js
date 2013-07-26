loaf = require "loaf"

class BlockWriter 
  
  ###
  ###

  constructor: (@paper, @nodeFactory) ->

  ###
  ###

  write: (script, contentFactory, childBindings) =>
    section = loaf()
    section.toFragment()


module.exports = BlockWriter

    