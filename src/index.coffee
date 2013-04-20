Clip = require("./clip")
Paper = require("./paper")


class Paperclip

  ###
  ###

  constructor: () ->

  ###
   attaches the context (data), to the element
  ###

  attach: (context, element) ->






module.exports = () -> new Paperclip()

# clips compiled data-binding to observables
module.exports.Clip  = Clip
module.exports.Paper = Paper
