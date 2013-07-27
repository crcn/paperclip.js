loaf = require "loaf"
decorFactory = require "../decor/blockFactory"
Clip = require "../../clip"

class BlockWriter extends require("./base")
  

  ###
  ###

  write: (script, contentFactory, childBindings) =>
    section = loaf()
    clip = new Clip { script: script, watch: false }
    @bindings.push decorFactory.getDecor section, clip, @nodeFactory
    section.toFragment()


module.exports = BlockWriter

    