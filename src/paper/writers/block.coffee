
loaf                = require "loaf"
blockBindingFactory = require "../bindings/block/factory"
Clip                = require "../../clip"

class BlockWriter extends require("./base")
  

  ###
  ###

  write: (script, contentFactory, childBlockFactory) =>

    tpl      = if contentFactory then @template.creator(contentFactory, @application) else undefined
    childTpl = if childBlockFactory then @template.creator(childBlockFactory, @application) else undefined


    @binders.push binder = blockBindingFactory.getBinder(ops = {
      script: script,
      template: tpl,
      application: @application,
      childBlockTemplate: childTpl
    })

    # returns a collection of the elements that this block owns, controlled
    # by the loaf specified above
    node = binder.getNode(ops) or @getDefaultNode(ops)

    binder.prepare(ops)
    node

  ###
  ###

  getDefaultNode: (ops) ->
    ops.section = section = loaf(@nodeFactory)
    section.render()



module.exports = BlockWriter


