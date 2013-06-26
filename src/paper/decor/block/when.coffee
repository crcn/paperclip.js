###

{{#when:condition}}
  do something
{{/}}


###


class BlockDecor extends require("./base")
  

  ###
  ###

  load: (@context) ->
    if @_show = !!@clip.get(@scriptName)
      @child = @node.createContent()
      @child.load context

  ###
  ###

  bind: () ->
    super()
    @child?.bind()

  ###
  ###

  _onChange: (value) =>

    show = !!value
    return if @_show is show
    @_show = show

    if show
      @child = @node.createContent().attach(@node, @context).bind()
    else
      @child?.dispose()
      @child = undefined
      


module.exports = BlockDecor