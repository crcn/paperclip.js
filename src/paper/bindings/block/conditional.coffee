###

{{#when:condition}}
  do something
{{/}}


###


class BlockDecor extends require("./base")

  ###
  ###

  _onChange: (value, oldValue) ->

    child = @child

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
      @section.replaceChildNodes @child.render()
    else if child?
      child.dispose()

  ###
  ###

  unbind: () ->
    super()
    @child?.dispose()




module.exports = BlockDecor