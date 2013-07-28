Clip      = require "./clip"
paper     = require "./paper"

# clips compiled data-binding to observables
module.exports = paper

if typeof window isnt "undefined"
  window.paperclip = module.exports
