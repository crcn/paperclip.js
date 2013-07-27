nofactor   = require "nofactor"
Loader     = require "./loader"

class Template

  ###
  ###

  constructor: (@paper, @nodeFactory) ->

  ###
  ###

  load: (context) -> new Loader(@).load context

  ###
  ###

  bind: (context) -> @load(context).bind()



module.exports = tpl = (paperOrSrc, nodeFactory = nofactor.default) ->

  if typeof paperOrSrc is "string"

    unless tpl.compiler
      throw new Error "template must be a function"

    paper = tpl.compiler.compile paperOrSrc

  else
    paper = paperOrSrc


  new Template paper, nodeFactory