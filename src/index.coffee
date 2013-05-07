Clip  = require "./clip"
paper = require "./paper"


# clips compiled data-binding to observables
module.exports.Clip     = Clip
module.exports.paper    = paper
module.exports.Context  = paper.Context
module.exports.bindable = require "bindable"

if typeof window isnt "undefined"
  window.paperclip = module.exports
