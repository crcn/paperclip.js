###

{{#when:condition}}
  do something
{{/}}


###


class BlockDecor extends require("./base")
  
  ###
  ###

  @scriptName: "when"

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

  _onChange: (value) =>
    if value
      @node.createContent().attach @node, @context
    else
      @node.section.html("")
      


module.exports = BlockDecor