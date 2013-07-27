Clip      = require "./clip"
paper     = require "./paper"
browser   = require "./browser"
translate = require "./translate"


module.exports = browser

# node
module.exports.compile  = translate.compile
paper.template.compiler = translate

# clips compiled data-binding to observables
module.exports = 
  Clip             : Clip
  template         : paper.template
  bindable         : require("bindable")
  registerModifier : paper.registerModifier

if typeof window isnt "undefined"
  window.paperclip = module.exports
