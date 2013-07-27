nofactor   = require "nofactor"
Loader     = require "./loader"

class Template

  ###
  ###

  constructor: (@paper, @nodeFactory = nofactor.default) ->

  ###
  ###

  load: (context) -> new Loader(@).load context

  ###
  ###

  bind: (context) -> @load(context).bind()


module.exports = Template