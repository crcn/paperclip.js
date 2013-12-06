nofactor   = require "nofactor"
Loader     = require "./loader"

class Template
  
  ###
  ###

  constructor: (@paper, @application) ->

  ###
  ###

  bind: (context) -> new Loader(@).load(context).bind()




Template.prototype.creator = module.exports = tpl = (paperOrSrc, application) ->

  # no application? create a fake application
  # context
  unless application
    application = {
      nodeFactory : nofactor.default # creates DOM elements
    }

  if typeof paperOrSrc is "string"

    unless tpl.compiler
      throw new Error "template must be a function"

    paper = tpl.compiler.compile paperOrSrc, { eval: true }

  else
    paper = paperOrSrc


  new Template paper, application