###

{{#when:condition}}
  do something
{{/}}


###


class BlockDecor extends require("./base")

  ###
  ###

  _onChange: (value, oldValue) ->

    oldChild = @child

    # remove the previous child if it exists
    @child?.unbind()
    @child = undefined


    # true? use THIS blocks content
    if value
      childTemplate = @contentTemplate

    # otherwise use the child - might be an else statement
    else
      childTemplate = @childBlockTemplate

    # child template might not exist - check for it
    if childTemplate
      @child = childTemplate.bind(@context)
      @section.replaceChildNodes @child.section.toFragment()
    else if oldChild?
      oldChild.remove()

  ###
  ###

  unbind: () ->
    super()
    @child?.dispose()




module.exports = BlockDecor