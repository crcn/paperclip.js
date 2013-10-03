###

{{#when:condition}}
  do something
{{/}}


###


class BlockDecor extends require("./base")

  ###
  ###

  _map: (value) -> !!value

  ###
  ###

  _onChange: (value) =>

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
      oldChild.section.hide()




module.exports = BlockDecor