Clip  = require "./clip"
Paper = require "./paper"


class Paperclip

  ###
  ###

  constructor: () ->

  ###
   attaches the context (data), to the element
  ###

  attach: (data, element) ->
    dom = new Paper.DOM()
    dom.attach data, element



module.exports = () -> new Paperclip()

# clips compiled data-binding to observables
module.exports.Clip     = Clip
module.exports.Paper    = Paper
module.exports.bindable = require "bindable"


if typeof window isnt "undefined"
  window.paperclip = module.exports
