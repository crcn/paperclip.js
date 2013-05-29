###

{{#when:condition}}
  do something
{{/}}


###


class BlockDecor extends require("./base")
  
  ###
  ###

  @scriptName: "with"

  ###
  ###

  load: (@context) ->
    @child = @node.createContent()
    @child.load @_childContext(context)


  ###
  ###


  _childContext: (context) ->
    context.child @clip.get("with")

  ###
  ###

  bind: () ->
    super()
    @child.bind()

  ###
  ###

  _onChange: (value) =>
    @child.context.reset value
      


module.exports = BlockDecor