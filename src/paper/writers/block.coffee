
loaf                = require "loaf"
blockBindingFactory = require "../bindings/block/factory"
Clip                = require "../../clip"

class BlockWriter extends require("./base")
  

  ###
  ###

  write: (script, contentFactory, childBlockFactory) =>


    tpl      = if contentFactory then @template.creator(contentFactory, @application) else undefined
    childTpl = if childBlockFactory then @template.creator(childBlockFactory, @application) else undefined

    # creates a document fragment which can be modified in a document
    section = loaf @nodeFactory

    # clips the scripts to the context
    clip = new Clip { script: script, watch: false }

    # add any bindings that might exist
    @bindings.push blockBindingFactory.getBindings({
      section: section
      clip: clip,
      template: tpl,
      application: @application,
      childBlockTemplate: childTpl
    })...

    # returns a collection of the elements that this block owns, controlled
    # by the loaf specified above
    section.toFragment()


module.exports = BlockWriter


    