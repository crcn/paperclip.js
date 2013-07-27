
loaf                = require "loaf"
blockBindingFactory = require "../bindings/block/factory"
Clip                = require "../../clip"
ClipBinding         = require "../bindings/clip"

class BlockWriter extends require("./base")
  

  ###
  ###

  write: (script, contentFactory, childBindings) =>
    section = loaf()
    
    clip = new Clip { script: script, watch: false }

    @bindings.push new ClipBinding clip
    @bindings.push blockBindingFactory.getBindings section, clip, @nodeFactory

    section.toFragment()


module.exports = BlockWriter


    