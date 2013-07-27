Clip  = require "./clip"
paper = require "./paper"


# clips compiled data-binding to observables
module.exports = 
  Clip             : Clip
  template         : paper.template
  bindable         : require("bindable")
  registerModifier : paper.registerModifier

if typeof window isnt "undefined"
  window.paperclip = module.exports
