###

{{#when:condition}}
  do something
{{/}}


###


class BlockDecor extends require("./base")
  

  ###
  ###

  load: (@context, callback) ->
    if @clip.get("when")
      @child = @node.createContent()
      @child.load context, callback
    else
      callback()

  ###
  ###

  bind: () ->
    super()
    @child.bind()

  ###
  ###

  _onChange: (value) =>
    if value
      @child = @node.createContent().attach(@node, @context).bind()
    else
      @child.dispose()
      


module.exports = BlockDecor