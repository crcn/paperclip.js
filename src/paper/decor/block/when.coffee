###

{{#when:condition}}
  do something
{{/}}


###


class BlockDecor extends require("./base")
  

  ###
  ###

  load: (@context, callback) ->
    if @_show = !!@clip.get("when")
      @child = @node.createContent()
      @child.load context, callback
    else
      callback()

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