Clip  = require "./clip"
paper = require "./paper"


# clips compiled data-binding to observables
module.exports = 
  Clip             : Clip
  paper            : paper
  Context          : paper.Context
  bindable         : require("bindable")
  writers          : require("./paper/writers")
  registerModifier : paper.registerModifier

if typeof window isnt "undefined"
  window.paperclip = module.exports
