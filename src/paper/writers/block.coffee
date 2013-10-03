
loaf                = require "loaf"
blockBindingFactory = require "../bindings/block/factory"
Clip                = require "../../clip"
ClipBinding         = require "../bindings/clip"

class BlockWriter extends require("./base")
  

  ###
  ###

  write: (script, contentFactory, childBlockFactory) =>


    tpl      = if contentFactory then @template.creator(contentFactory) else undefined
    childTpl = if childBlockFactory then @template.creator(childBlockFactory) else undefined

    # creates a document fragment which can be modified in a document
    section = loaf @nodeFactory

    # clips the scripts to the context
    clip = new Clip { script: script, watch: false }

    # binds the context to the particular script - needed for the block bindings
    # @bindings.push new ClipBinding clip

    # add any bindings that might exist
    @bindings.push blockBindingFactory.getBindings({
      section: section
      clip: clip,
      template: tpl,
      nodeFactory: @nodeFactory,
      childBlockTemplate: childTpl
    })...

    # returns a collection of the elements that this block owns, controlled
    # by the loaf specified above
    section.toFragment()


module.exports = BlockWriter


    